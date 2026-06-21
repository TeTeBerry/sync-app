import { useCallback } from 'react';
import { goActivitySchedule, goAiTravelGuide, goEventDetail } from '@/utils/route';
import type {
  FestivalPlanChecklist,
  FestivalPlanTask,
} from './buildFestivalPlanChecklist';
import type { FestivalPlanTaskActions } from './festivalPlanTaskActions';

export function useFestivalPlanNavigation(
  activityLegacyId?: number,
  checklist?: FestivalPlanChecklist | null,
  actions?: FestivalPlanTaskActions | null,
) {
  return useCallback(
    (task: FestivalPlanTask) => {
      if (activityLegacyId == null || Number.isNaN(activityLegacyId)) return;

      if (task.done) {
        switch (task.key) {
          case 'travel_guide':
            if (checklist?.travelGuideId) {
              goAiTravelGuide(checklist.travelGuideId);
            }
            return;
          case 'itinerary':
            goActivitySchedule(activityLegacyId, {
              hasItinerary: Boolean(checklist?.itineraryDayCount),
            });
            return;
          case 'buddy_post':
            if (checklist?.buddyPostId) {
              goEventDetail(activityLegacyId, {
                postId: checklist.buddyPostId,
                focusPosts: true,
                openBuddyPost: true,
              });
              return;
            }
            if (actions?.openBuddyPostSheet) {
              actions.openBuddyPostSheet();
              return;
            }
            goEventDetail(activityLegacyId, {
              focusPosts: true,
              openBuddyPost: true,
            });
            return;
        }
        return;
      }

      switch (task.key) {
        case 'travel_guide':
          actions?.runCapability('travel_guide', { source: 'festival_plan' });
          return;
        case 'itinerary':
          actions?.runCapability('itinerary', { source: 'festival_plan' });
          return;
        case 'buddy_post':
          actions?.runCapability('buddy_post', { source: 'festival_plan' });
          return;
      }
    },
    [
      actions,
      activityLegacyId,
      checklist?.buddyPostId,
      checklist?.itineraryDayCount,
      checklist?.travelGuideId,
    ],
  );
}
