import { useMemo, useState } from 'react';
import { useDidShow } from '@tarojs/taro';
import { useFestivalPlanProgressQuery } from '@/hooks/sync/festivalPlanProgress';
import { useFestivalPlanSummary } from '../useFestivalPlanSummary';
import { useFestivalPlanNavigation } from '../useFestivalPlanNavigation';
import { createFestivalPlanTaskActions } from '../festivalPlanRouteHandlers';

export type UseEventDetailFestivalPlanParams = {
  activityLegacyId?: number;
  openTravelGuideSheet: () => void;
  openItinerary: () => void;
  openBuddyPostSheet: () => void;
};

export function useEventDetailFestivalPlan({
  activityLegacyId,
  openTravelGuideSheet,
  openItinerary,
  openBuddyPostSheet,
}: UseEventDetailFestivalPlanParams) {
  const [refreshKey, setRefreshKey] = useState(0);

  useDidShow(() => {
    setRefreshKey((key) => key + 1);
  });

  const checklist = useFestivalPlanSummary(activityLegacyId, refreshKey);
  const progressQuery = useFestivalPlanProgressQuery(activityLegacyId);
  const unreadReplyCount = progressQuery.data?.unreadReplyCount ?? 0;

  const actions = useMemo(
    () =>
      createFestivalPlanTaskActions({
        openTravelGuideSheet,
        openItinerary,
        openBuddyPostSheet,
      }),
    [openBuddyPostSheet, openItinerary, openTravelGuideSheet],
  );

  const onTaskPress = useFestivalPlanNavigation(activityLegacyId, checklist, actions);

  const allComplete = checklist != null && !checklist.nextTaskKey;

  return {
    checklist,
    onTaskPress,
    allComplete,
    unreadReplyCount,
  };
}
