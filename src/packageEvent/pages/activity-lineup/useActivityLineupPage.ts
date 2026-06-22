import Taro, { useRouter } from '@tarojs/taro';
import { useMemo } from 'react';
import { useActivityDetailQuery } from '@/hooks/sync/activities';
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

  const schedule = scheduleQuery.data;
  const schedulePublished = schedule?.schedulePublished === true;
  const lineupPublished = activityQuery.data?.lineupPublished !== false;

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

  const pageTitle = activityQuery.data?.name ?? schedule?.eventMeta ?? '';
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
    loading: apiEnabled && (activityQuery.isLoading || scheduleQuery.isLoading),
    error: scheduleQuery.isError,
    refetch: scheduleQuery.refetch,
  };
}
