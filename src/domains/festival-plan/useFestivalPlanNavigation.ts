import { useCallback } from 'react';
import Taro from '@tarojs/taro';
import { goAiTravelGuide, goEventDetail, goMyItinerary, ROUTES } from '@/utils/route';
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
            goMyItinerary(activityLegacyId, checklist?.itinerarySelectedDjIds);
            return;
          case 'buddy_post':
            if (checklist?.buddyPostId) {
              goEventDetail(activityLegacyId, { postId: checklist.buddyPostId });
            } else {
              void Taro.navigateTo({ url: ROUTES.PROFILE_POSTS });
            }
            return;
          case 'registration':
            goEventDetail(activityLegacyId);
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
        case 'registration':
          goEventDetail(activityLegacyId);
          return;
      }
    },
    [
      actions,
      activityLegacyId,
      checklist?.buddyPostId,
      checklist?.itinerarySelectedDjIds,
      checklist?.travelGuideId,
    ],
  );
}
