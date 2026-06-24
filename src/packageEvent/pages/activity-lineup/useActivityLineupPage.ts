import Taro, { useRouter } from '@tarojs/taro';
import { useMemo } from 'react';
import { useActivityDetailQuery } from '@/hooks/sync/activities';
import { useActivityPerformanceBundleOffline } from '@/hooks/useActivityPerformanceBundleOffline';
import { useActivityPerformanceBundleWriter } from '@/hooks/useActivityPerformanceBundleWriter';
import { useItineraryScheduleQuery } from '@/hooks/useItineraryApi';
import { useStackPageMainHeight } from '@/hooks/useTabPageMainHeight';
import { isLiveApi } from '@/constants/api';
import {
  groupPerformancesBySession,
  type LineupSessionGroup,
} from './utils/groupLineupBySession';
import type { ItineraryDj } from '@/types/itinerary';
import { resolveEventDetailIdFromQuery, ROUTES } from '@/utils/route';
import { selectActiveActivityLegacyId, useNavigationStore } from '@/stores';

const CTA_FOOTER_BASE_PX = 74;

function resolveFooterChromePx(): number {
  try {
    const win = Taro.getWindowInfo();
    const screenHeight = win.screenHeight ?? win.windowHeight ?? 667;
    const safeBottom =
      win.safeArea != null ? Math.max(0, screenHeight - win.safeArea.bottom) : 0;
    return CTA_FOOTER_BASE_PX + safeBottom;
  } catch {
    return CTA_FOOTER_BASE_PX;
  }
}

export function useActivityLineupPage() {
  const router = useRouter();
  const activeActivityLegacyId = useNavigationStore(selectActiveActivityLegacyId);
  const activityLegacyId = useMemo(
    () => resolveEventDetailIdFromQuery(router.params, activeActivityLegacyId),
    [activeActivityLegacyId, router.params],
  );

  const apiEnabled =
    isLiveApi() && Number.isFinite(activityLegacyId) && activityLegacyId > 0;

  const activityQuery = useActivityDetailQuery(
    apiEnabled ? activityLegacyId : undefined,
  );
  const scheduleQuery = useItineraryScheduleQuery(apiEnabled ? activityLegacyId : null);

  const queryFailed = activityQuery.isError || scheduleQuery.isError;
  const offline = useActivityPerformanceBundleOffline(activityLegacyId, {
    queryFailed,
  });

  const activity = activityQuery.data ?? offline.bundle?.activity ?? undefined;
  const schedule = scheduleQuery.data ?? offline.bundle?.schedule;
  const schedulePublished = schedule?.schedulePublished === true;
  const lineupPublished = activity?.lineupPublished !== false;

  useActivityPerformanceBundleWriter(apiEnabled ? activityLegacyId : undefined, {
    activity: activityQuery.data,
    schedule: scheduleQuery.data,
  });

  const sessionGroups = useMemo<LineupSessionGroup[]>(() => {
    if (!schedule?.schedulePublished) {
      return [];
    }
    return groupPerformancesBySession(schedule);
  }, [schedule]);

  const lineupDjs = useMemo<ItineraryDj[]>(() => {
    const djs = schedule?.djs ?? [];
    return [...djs].sort((a, b) => b.popularity - a.popularity);
  }, [schedule?.djs]);

  const pageTitle = activity?.name ?? schedule?.eventMeta ?? '';
  const showFooterCta = schedulePublished && sessionGroups.length > 0;
  const footerChromePx = useMemo(() => resolveFooterChromePx(), []);
  const mainScrollHeight = useStackPageMainHeight(showFooterCta ? footerChromePx : 0);

  const navFallback =
    Number.isFinite(activityLegacyId) && activityLegacyId > 0
      ? ROUTES.EVENT_DETAIL
      : ROUTES.EVENTS;

  return {
    activityLegacyId,
    navFallback,
    pageTitle,
    mainScrollHeight,
    schedulePublished,
    lineupPublished,
    sessionGroups,
    lineupDjs,
    showFooterCta,
    activity,
    loading:
      apiEnabled &&
      !offline.isOfflineBundle &&
      (activityQuery.isLoading || scheduleQuery.isLoading),
    error: queryFailed && !offline.isOfflineBundle,
    isOfflineBundle: offline.isOfflineBundle,
    bundleSavedAt: offline.bundleSavedAt,
    refetch: scheduleQuery.refetch,
  };
}
