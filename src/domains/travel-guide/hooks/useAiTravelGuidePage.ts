import Taro, {
  useDidShow,
  useRouter,
  useShareAppMessage,
  useShareTimeline,
} from '@tarojs/taro';
import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import {
  fetchTravelGuidePlan,
  generateTravelGuide,
  patchTravelGuideBudgetTier,
} from '@/api/sync/travelGuide';
import type { TravelGuideGenerationJobProgress } from '@/types/travelGuide';
import { useActivityDetailQuery } from '@/hooks/useSyncApi';
import { useStackPageMainHeight } from '@/hooks/useTabPageMainHeight';
import { goEventDetailWithBuddyPostPrefill, ROUTES } from '@/utils/route';
import { isAuthGated, requireAuth } from '@/utils/authGate';
import { travelGuideFormToBuddyPrefill } from '@/utils/travelGuideToBuddyPost';
import {
  loadTravelGuideDetail,
  saveTravelGuideDetail,
  type TravelGuideDetailPayload,
} from '../utils/travelGuideDetailStorage';
import { markTravelGuideSearchPrefillPending } from '../utils/travelGuideSearchPrefillStorage';
import { hideThemedLoading, showThemedLoading } from '@/utils/themedLoading';
import { getTravelGuideTitle } from '@/constants/aiCtaLabels';
import {
  isDomesticActivityRegion,
  shouldShowTravelGuideSelfDriveOption,
} from '@/constants/activityMapRegion';
import { parseActivityDayCount } from '@/utils/parseActivityDayCount';
import { eventCityFromLocation } from '@/utils/travelGuideDepartureSuggestions';
import { buildTravelGuideShareText } from '../utils/travelGuideShareText';
import {
  buildTravelGuideShareAppMessage,
  buildTravelGuideShareTimeline,
  buildTravelGuideShareQueryKey,
  parseTravelGuideFormFromShareQuery,
} from '../utils/travelGuideWechatShare.util';
import {
  computeAiTravelGuideFooterChromePx,
  resolveTravelGuideShareRef,
} from './aiTravelGuidePage.util';
import type { AiGuidePlanFormValues, TravelGuideBudgetTier } from '@/types/travelGuide';
import { useT } from '@/hooks/useI18n';
import { showAppToast } from '@/utils/appToast';
import { shouldShowPeaceBanner } from '../utils/shouldShowPeaceBanner';
import { resolveTravelGuideBudgetTier } from '../utils/travelGuideBudgetLabels';

const FOOTER_BASE_PX = 72;

function resolveFooterChromePx(): number {
  try {
    return computeAiTravelGuideFooterChromePx(Taro.getWindowInfo(), FOOTER_BASE_PX);
  } catch {
    return FOOTER_BASE_PX;
  }
}

export function useAiTravelGuidePage() {
  const router = useRouter();
  const guideId = router.params.guideId?.trim() ?? '';
  const [payload, setPayload] = useState<TravelGuideDetailPayload | null>(() =>
    guideId ? loadTravelGuideDetail(guideId) : null,
  );
  const [loading, setLoading] = useState(false);
  const [regenerating, setRegenerating] = useState(false);
  const [generationProgress, setGenerationProgress] =
    useState<TravelGuideGenerationJobProgress | null>(null);
  const [shareGenerationDone, setShareGenerationDone] = useState(false);
  const [loadError, setLoadError] = useState<string | null>(null);
  const [sharing, setSharing] = useState(false);
  const [budgetTierUpdating, setBudgetTierUpdating] = useState(false);
  const [guideSheetOpen, setGuideSheetOpen] = useState(false);
  const [peaceBannerDismissed, setPeaceBannerDismissed] = useState(false);
  const shareRef = useRef<{
    guideId: string;
    payload: TravelGuideDetailPayload;
  } | null>(null);

  const shareQueryKey = useMemo(
    () => buildTravelGuideShareQueryKey(router.params),
    [router.params],
  );
  const shareSeed = useMemo(
    () => parseTravelGuideFormFromShareQuery(router.params),
    [shareQueryKey],
  );
  const shareGenerationInFlightRef = useRef<string | null>(null);
  const shareGenerationDoneRef = useRef(shareGenerationDone);
  shareGenerationDoneRef.current = shareGenerationDone;
  const shouldGenerateFromShare = Boolean(
    shareSeed &&
    guideId &&
    !shareGenerationDone &&
    (!payload || shareSeed.forceRegenerate),
  );
  const activityLegacyId = payload?.activityLegacyId ?? shareSeed?.activityLegacyId;
  const activityQuery = useActivityDetailQuery(activityLegacyId);

  const footerChromePx = useMemo(() => resolveFooterChromePx(), []);
  const mainScrollHeight = useStackPageMainHeight(footerChromePx);
  const isWeapp = Taro.getEnv() === Taro.ENV_TYPE.WEAPP;
  const t = useT();

  useEffect(() => {
    setPayload(guideId ? loadTravelGuideDetail(guideId) : null);
    setShareGenerationDone(false);
    shareGenerationDoneRef.current = false;
    shareGenerationInFlightRef.current = null;
  }, [guideId]);

  useEffect(() => {
    if (!payload?.activityLegacyId || !guideId) return;
    markTravelGuideSearchPrefillPending(payload.activityLegacyId, guideId);
  }, [guideId, payload?.activityLegacyId]);

  useEffect(() => {
    const seed = parseTravelGuideFormFromShareQuery(router.params);
    if (!seed || !guideId.trim() || shareGenerationDoneRef.current) {
      return;
    }
    const cachedPlan = loadTravelGuideDetail(guideId);
    if (cachedPlan && !seed.forceRegenerate) {
      return;
    }

    const attemptKey = `${guideId}:${shareQueryKey}`;
    if (shareGenerationInFlightRef.current === attemptKey) {
      return;
    }
    shareGenerationInFlightRef.current = attemptKey;

    let cancelled = false;

    const generateFromShare = async () => {
      if (seed.forceRegenerate) {
        setPayload(null);
      }
      setLoading(true);
      setGenerationProgress({ step: 'queued', percent: 2 });
      setLoadError(null);

      try {
        const { plan } = await generateTravelGuide(
          seed.activityLegacyId,
          {
            ...seed.form,
            guideId,
            ...(seed.forceRegenerate ? { forceRegenerate: true } : {}),
          },
          {
            onProgress: (progress) => {
              if (!cancelled) {
                setGenerationProgress(progress);
              }
            },
          },
        );
        if (cancelled) {
          return;
        }

        const next: TravelGuideDetailPayload = {
          plan,
          form: {
            ...seed.form,
            budgetTier: resolveTravelGuideBudgetTier(seed.form.budgetTier),
          },
          activityLegacyId: seed.activityLegacyId,
          createdAt: new Date().toISOString(),
        };
        saveTravelGuideDetail(guideId, next);
        setPayload(next);
        setShareGenerationDone(true);
        shareGenerationDoneRef.current = true;
      } catch (error) {
        if (cancelled) {
          return;
        }
        const message =
          error instanceof Error ? error.message : t('travelGuide.loadFailed');
        setLoadError(message);
        setShareGenerationDone(true);
        shareGenerationDoneRef.current = true;
      } finally {
        if (shareGenerationInFlightRef.current === attemptKey) {
          shareGenerationInFlightRef.current = null;
          setLoading(false);
          setGenerationProgress(null);
        }
      }
    };

    const run = async () => {
      if (isAuthGated()) {
        requireAuth(() => {
          void generateFromShare();
        }, 'ai_assistant');
        return;
      }
      await generateFromShare();
    };

    void run();
    return () => {
      cancelled = true;
    };
  }, [guideId, shareQueryKey]);

  useEffect(() => {
    if (shouldGenerateFromShare || !guideId.trim()) {
      return;
    }

    let cancelled = false;

    const loadDetail = async () => {
      setLoadError(null);
      const hasLocalCache = Boolean(guideId && loadTravelGuideDetail(guideId));
      if (!hasLocalCache) {
        setLoading(true);
      }

      try {
        const remote = await fetchTravelGuidePlan(guideId);
        if (cancelled) return;

        if (remote) {
          const next: TravelGuideDetailPayload = {
            plan: remote.plan,
            form: {
              ...remote.form,
              budgetTier: resolveTravelGuideBudgetTier(remote.form.budgetTier),
            },
            activityLegacyId: remote.activityLegacyId,
            createdAt: remote.createdAt,
          };
          saveTravelGuideDetail(guideId, next);
          setPayload(next);
          return;
        }

        if (!payload) {
          setLoadError(t('travelGuide.notFound'));
        }
      } catch (error) {
        if (cancelled) return;
        if (payload) return;
        const message =
          error instanceof Error ? error.message : t('travelGuide.loadFailed');
        setLoadError(message);
      } finally {
        if (!cancelled) setLoading(false);
      }
    };

    void loadDetail();
    return () => {
      cancelled = true;
    };
  }, [guideId, shouldGenerateFromShare, t]);

  const showGenerationLoader = Boolean(
    regenerating ||
    generationProgress ||
    (shouldGenerateFromShare && loading && !payload?.plan),
  );

  useEffect(() => {
    shareRef.current = resolveTravelGuideShareRef({ guideId, payload });
  }, [guideId, payload]);

  useDidShow(() => {
    if (!isWeapp) return;
    void Taro.showShareMenu({
      withShareTicket: true,
      showShareItems: ['shareAppMessage', 'shareTimeline'],
    }).catch(() => undefined);
  });

  useShareAppMessage(() => {
    const current = shareRef.current;
    if (!current) {
      return { title: getTravelGuideTitle(), path: ROUTES.AI_TRAVEL_GUIDE };
    }
    return buildTravelGuideShareAppMessage(
      current.guideId,
      current.payload,
      activityQuery.data?.image,
    );
  });

  useShareTimeline(() => {
    const current = shareRef.current;
    if (!current) {
      return { title: getTravelGuideTitle() };
    }
    return buildTravelGuideShareTimeline(
      current.guideId,
      current.payload,
      activityQuery.data?.image,
    );
  });

  const handleCopyShare = useCallback(async () => {
    if (!payload?.plan || sharing) return;
    setSharing(true);
    try {
      const text = buildTravelGuideShareText(payload.plan);
      await Taro.setClipboardData({ data: text });
      showAppToast('travelGuide.copySuccess', { icon: 'success' });
    } catch {
      showAppToast('travelGuide.copyFailed', { icon: 'none' });
    } finally {
      setSharing(false);
    }
  }, [payload?.plan, sharing, t]);

  const guideDefaultNights = useMemo(
    () => parseActivityDayCount(activityQuery.data?.date),
    [activityQuery.data?.date],
  );
  const guideEventCity = useMemo(
    () => eventCityFromLocation(activityQuery.data?.location),
    [activityQuery.data?.location],
  );
  const guideShowSelfDriveOption = shouldShowTravelGuideSelfDriveOption(
    activityQuery.data?.region,
  );
  const guideShowAccommodationOption = isDomesticActivityRegion(
    activityQuery.data?.region,
  );

  const handleRegenerate = useCallback(() => {
    if (!payload?.activityLegacyId || !guideId) return;
    requireAuth(() => setGuideSheetOpen(true), 'ai_assistant');
  }, [guideId, payload?.activityLegacyId]);

  const closeGuideSheet = useCallback(() => {
    setGuideSheetOpen(false);
  }, []);

  const handleGuideSheetSubmit = useCallback(
    (form: AiGuidePlanFormValues) => {
      if (!payload?.activityLegacyId || !guideId) return;
      const activityLegacyId = payload.activityLegacyId;
      setGuideSheetOpen(false);
      setPayload(null);

      const run = async () => {
        setRegenerating(true);
        setGenerationProgress({ step: 'queued', percent: 2 });
        try {
          const { plan } = await generateTravelGuide(
            activityLegacyId,
            {
              ...form,
              guideId,
              forceRegenerate: true,
            },
            {
              onProgress: (progress) => setGenerationProgress(progress),
            },
          );
          const next: TravelGuideDetailPayload = {
            plan,
            form: {
              ...form,
              budgetTier: resolveTravelGuideBudgetTier(form.budgetTier),
            },
            activityLegacyId,
            createdAt: new Date().toISOString(),
          };
          saveTravelGuideDetail(guideId, next);
          setPayload(next);
        } catch (error) {
          const message =
            error instanceof Error
              ? error.message
              : t('travelPlan.guideGenerationFailed');
          showAppToast(message, { raw: true, icon: 'none' });
        } finally {
          setRegenerating(false);
          setGenerationProgress(null);
        }
      };

      requireAuth(() => void run(), 'ai_assistant');
    },
    [guideId, payload?.activityLegacyId, t],
  );

  const handlePrefillRecruitPost = useCallback(() => {
    if (!payload?.activityLegacyId || !payload.form) return;
    const activityLegacyId = payload.activityLegacyId;
    const prefill = travelGuideFormToBuddyPrefill(
      payload.form,
      activityQuery.data?.date,
      t,
    );
    requireAuth(
      () =>
        goEventDetailWithBuddyPostPrefill(activityLegacyId, {
          ...prefill,
          prefillBannerTitle: t('travelGuide.recruitPrefillBanner'),
        }),
      'social',
    );
  }, [activityQuery.data?.date, payload, t]);

  const handleSelectBudgetTier = useCallback(
    (tier: TravelGuideBudgetTier) => {
      if (!guideId || !payload || budgetTierUpdating) return;
      if (resolveTravelGuideBudgetTier(payload.form.budgetTier) === tier) return;

      const run = async () => {
        setBudgetTierUpdating(true);
        showThemedLoading({
          title: t('travelGuide.budgetCompareUpdating'),
          mask: true,
        });
        try {
          const remote = await patchTravelGuideBudgetTier(guideId, tier);
          const next: TravelGuideDetailPayload = {
            plan: remote.plan,
            form: remote.form,
            activityLegacyId: remote.activityLegacyId,
            createdAt: remote.createdAt,
          };
          saveTravelGuideDetail(guideId, next);
          setPayload(next);
        } catch (error) {
          const message =
            error instanceof Error ? error.message : t('travelGuide.loadFailed');
          showAppToast(message, { raw: true, icon: 'none' });
        } finally {
          hideThemedLoading();
          setBudgetTierUpdating(false);
        }
      };

      requireAuth(() => void run(), 'ai_assistant');
    },
    [budgetTierUpdating, guideId, payload, t],
  );

  const showRecruitBridge = Boolean(payload?.activityLegacyId && payload?.form);
  const showPeaceBanner = shouldShowPeaceBanner(Boolean(payload), peaceBannerDismissed);

  const handleDismissPeaceBanner = useCallback(() => {
    setPeaceBannerDismissed(true);
  }, []);

  return {
    guideId,
    payload,
    activityLegacyId,
    loading,
    showGenerationLoader,
    regenerating,
    generationProgress,
    loadError,
    mainScrollHeight,
    navFallback: ROUTES.HOME,
    sharing,
    budgetTierUpdating,
    selectedBudgetTier: resolveTravelGuideBudgetTier(payload?.form.budgetTier),
    isWeapp,
    handleCopyShare,
    handleRegenerate,
    handlePrefillRecruitPost,
    handleSelectBudgetTier,
    showRecruitBridge,
    showPeaceBanner,
    handleDismissPeaceBanner,
    guideSheetOpen,
    closeGuideSheet,
    handleGuideSheetSubmit,
    guideDefaultNights,
    guideEventCity,
    guideShowSelfDriveOption,
    guideShowAccommodationOption,
    activityRegion: activityQuery.data?.region,
    guideSheetInitialValues: payload?.form ?? null,
  };
}
