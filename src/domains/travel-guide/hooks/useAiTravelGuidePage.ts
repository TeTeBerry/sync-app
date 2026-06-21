import Taro, {
  useDidShow,
  useRouter,
  useShareAppMessage,
  useShareTimeline,
} from '@tarojs/taro';
import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { fetchTravelGuidePlan, generateTravelGuide } from '@/api/sync/travelGuide';
import { useActivityDetailQuery } from '@/hooks/useSyncApi';
import { useStackPageMainHeight } from '@/hooks/useTabPageMainHeight';
import { goAiAssistant, ROUTES } from '@/utils/route';
import { isAuthGated, requireAuth } from '@/utils/authGate';
import {
  loadTravelGuideDetail,
  saveTravelGuideDetail,
  type TravelGuideDetailPayload,
} from '../utils/travelGuideDetailStorage';
import { getTravelGuideTitle } from '@/constants/aiCtaLabels';
import { buildTravelGuideShareText } from '../utils/travelGuideShareText';
import {
  buildTravelGuideShareAppMessage,
  buildTravelGuideShareTimeline,
  parseTravelGuideFormFromShareQuery,
} from '../utils/travelGuideWechatShare.util';
import {
  computeAiTravelGuideFooterChromePx,
  resolveTravelGuideShareRef,
  shouldLoadTravelGuideDetail,
} from './aiTravelGuidePage.util';
import { useT } from '@/hooks/useI18n';

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
  const cachedPayload = useMemo(
    () => (guideId ? loadTravelGuideDetail(guideId) : null),
    [guideId],
  );
  const [payload, setPayload] = useState<TravelGuideDetailPayload | null>(
    cachedPayload,
  );
  const [loading, setLoading] = useState(false);
  const [loadError, setLoadError] = useState<string | null>(null);
  const [sharing, setSharing] = useState(false);
  const shareRef = useRef<{
    guideId: string;
    payload: TravelGuideDetailPayload;
  } | null>(null);

  const shareSeed = parseTravelGuideFormFromShareQuery(router.params);
  const activityLegacyId = payload?.activityLegacyId ?? shareSeed?.activityLegacyId;
  const activityQuery = useActivityDetailQuery(activityLegacyId);

  const footerChromePx = useMemo(() => resolveFooterChromePx(), []);
  const mainScrollHeight = useStackPageMainHeight(footerChromePx);
  const isWeapp = Taro.getEnv() === Taro.ENV_TYPE.WEAPP;
  const t = useT();

  useEffect(() => {
    setPayload(cachedPayload);
  }, [cachedPayload]);

  useEffect(() => {
    if (!shouldLoadTravelGuideDetail({ payload, guideId })) {
      return;
    }

    let cancelled = false;

    const regenerateFromShare = async () => {
      if (!shareSeed) return;

      const { plan } = await generateTravelGuide(shareSeed.activityLegacyId, {
        ...shareSeed.form,
        guideId,
      });
      if (cancelled) return;

      const next: TravelGuideDetailPayload = {
        plan,
        form: shareSeed.form,
        activityLegacyId: shareSeed.activityLegacyId,
        createdAt: new Date().toISOString(),
      };
      saveTravelGuideDetail(guideId, next);
      setPayload(next);
    };

    const loadDetail = async () => {
      setLoading(true);
      setLoadError(null);
      let deferLoadingStop = false;

      try {
        const remote = await fetchTravelGuidePlan(guideId);
        if (cancelled) return;

        if (remote) {
          const next: TravelGuideDetailPayload = {
            plan: remote.plan,
            form: remote.form,
            activityLegacyId: remote.activityLegacyId,
            createdAt: remote.createdAt,
          };
          saveTravelGuideDetail(guideId, next);
          setPayload(next);
          return;
        }

        if (!shareSeed) {
          setLoadError(t('travelGuide.notFound'));
          return;
        }

        const runRegenerate = async () => {
          try {
            await regenerateFromShare();
          } catch (error) {
            if (cancelled) return;
            const message =
              error instanceof Error ? error.message : t('travelGuide.loadFailed');
            setLoadError(message);
          }
        };

        if (isAuthGated()) {
          deferLoadingStop = true;
          requireAuth(() => {
            void runRegenerate().finally(() => {
              if (!cancelled) setLoading(false);
            });
          }, 'ai_assistant');
          return;
        }

        await runRegenerate();
      } catch (error) {
        if (cancelled) return;
        const message =
          error instanceof Error ? error.message : t('travelGuide.loadFailed');
        setLoadError(message);
      } finally {
        if (!cancelled && !deferLoadingStop) setLoading(false);
      }
    };

    void loadDetail();
    return () => {
      cancelled = true;
    };
  }, [guideId, payload, shareSeed, t]);

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
      void Taro.showToast({ title: t('travelGuide.copySuccess'), icon: 'success' });
    } catch {
      void Taro.showToast({ title: t('travelGuide.copyFailed'), icon: 'none' });
    } finally {
      setSharing(false);
    }
  }, [payload?.plan, sharing, t]);

  const handleRegenerate = useCallback(() => {
    if (!payload) return;
    requireAuth(
      () =>
        goAiAssistant({
          activityLegacyId: payload.activityLegacyId,
          prefillTravelGuideForm: payload.form,
        }),
      'ai_assistant',
    );
  }, [payload]);

  return {
    guideId,
    payload,
    activityLegacyId,
    loading,
    loadError,
    mainScrollHeight,
    navFallback: ROUTES.AI,
    sharing,
    isWeapp,
    handleCopyShare,
    handleRegenerate,
  };
}
