import { useCallback, useMemo } from 'react';
import { goEventDetail, goExclusiveItinerary } from '@/utils/route';
import { useFestivalPlanSummary } from '../useFestivalPlanSummary';
import { useFestivalPlanNavigation } from '../useFestivalPlanNavigation';
import { createFestivalPlanTaskActions } from '../festivalPlanRouteHandlers';

export function useHomeFestivalPlanNavigation(activityLegacyId?: number) {
  const checklist = useFestivalPlanSummary(activityLegacyId);

  const openTravelGuideSheet = useCallback(() => {
    if (activityLegacyId == null || Number.isNaN(activityLegacyId)) {
      return;
    }
    goEventDetail(activityLegacyId, { openGuide: true });
  }, [activityLegacyId]);

  const openItinerary = useCallback(() => {
    if (activityLegacyId == null || Number.isNaN(activityLegacyId)) {
      return;
    }
    goExclusiveItinerary(activityLegacyId);
  }, [activityLegacyId]);

  const openBuddyPostSheet = useCallback(() => {
    if (activityLegacyId == null || Number.isNaN(activityLegacyId)) {
      return;
    }
    goEventDetail(activityLegacyId, {
      openBuddyPost: true,
      focusPosts: true,
    });
  }, [activityLegacyId]);

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

  const openFestivalPlanHub = useCallback(() => {
    if (activityLegacyId == null || Number.isNaN(activityLegacyId)) {
      return;
    }
    goEventDetail(activityLegacyId);
  }, [activityLegacyId]);

  return {
    checklist,
    onTaskPress,
    openFestivalPlanHub,
  };
}
