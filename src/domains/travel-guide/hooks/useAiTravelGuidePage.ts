import Taro, {
  useDidShow,
  useRouter,
  useShareAppMessage,
  useShareTimeline,
} from '@tarojs/taro';
import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { generateTravelGuide } from '@/api/sync/travelGuide';
import { useActivityDetailQuery } from '@/hooks/useSyncApi';
import { useStackPageMainHeight } from '@/hooks/useTabPageMainHeight';
import { goAiAssistant, ROUTES } from '@/utils/route';
import { isAuthGated, requireAuth } from '@/utils/authGate';
import {
  loadTravelGuideDetail,
  saveTravelGuideDetail,
  type TravelGuideDetailPayload,
} from '../utils/travelGuideDetailStorage';
import { TRAVEL_GUIDE_TITLE } from '@/constants/aiCtaLabels';
import { buildTravelGuideShareText } from '../utils/travelGuideShareText';
import {
  buildTravelGuideShareAppMessage,
  buildTravelGuideShareTimeline,
  parseTravelGuideFormFromShareQuery,
} from '../utils/travelGuideWechatShare.util';

const FOOTER_BASE_PX = 72;

function resolveFooterChromePx(): number {
  try {
    const win = Taro.getWindowInfo();
    const screenHeight = win.screenHeight ?? win.windowHeight ?? 667;
    const safeBottom =
      win.safeArea != null ? Math.max(0, screenHeight - win.safeArea.bottom) : 0;
    return FOOTER_BASE_PX + safeBottom;
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

  useEffect(() => {
    setPayload(cachedPayload);
  }, [cachedPayload]);

  useEffect(() => {
    if (payload || !guideId || !shareSeed) return;

    let cancelled = false;

    const loadFromShare = () => {
      setLoading(true);
      setLoadError(null);

      void generateTravelGuide(shareSeed.activityLegacyId, shareSeed.form)
        .then(({ plan }) => {
          if (cancelled) return;
          const next: TravelGuideDetailPayload = {
            plan,
            form: shareSeed.form,
            activityLegacyId: shareSeed.activityLegacyId,
            createdAt: new Date().toISOString(),
          };
          saveTravelGuideDetail(guideId, next);
          setPayload(next);
        })
        .catch((error) => {
          if (cancelled) return;
          const message =
            error instanceof Error ? error.message : '攻略加载失败，请稍后重试';
          setLoadError(message);
        })
        .finally(() => {
          if (!cancelled) setLoading(false);
        });
    };

    if (isAuthGated()) {
      requireAuth(loadFromShare, 'ai_assistant');
      return () => {
        cancelled = true;
      };
    }

    loadFromShare();
    return () => {
      cancelled = true;
    };
  }, [guideId, payload, shareSeed]);

  useEffect(() => {
    shareRef.current = payload && guideId ? { guideId, payload } : null;
  }, [guideId, payload]);

  useDidShow(() => {
    if (!isWeapp) return;
    void Taro.showShareMenu({
      withShareTicket: true,
      menus: ['shareAppMessage', 'shareTimeline'],
    }).catch(() => undefined);
  });

  useShareAppMessage(() => {
    const current = shareRef.current;
    if (!current) {
      return { title: TRAVEL_GUIDE_TITLE, path: ROUTES.AI_TRAVEL_GUIDE };
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
      return { title: TRAVEL_GUIDE_TITLE };
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
      void Taro.showToast({ title: '攻略文案已复制', icon: 'success' });
    } catch {
      void Taro.showToast({ title: '复制失败，请稍后重试', icon: 'none' });
    } finally {
      setSharing(false);
    }
  }, [payload?.plan, sharing]);

  const handleRegenerate = useCallback(() => {
    if (!payload) return;
    requireAuth(
      () =>
        goAiAssistant({
          activityLegacyId: payload.activityLegacyId,
          openAiGuideSheet: true,
          autoRunTravelGuideForm: payload.form,
        }),
      'ai_assistant',
    );
  }, [payload]);

  return {
    guideId,
    payload,
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
