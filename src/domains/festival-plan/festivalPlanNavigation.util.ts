import { goAiTravelGuide, goEventDetail, goExclusiveItinerary } from '@/utils/route';
import type {
  FestivalPlanChecklist,
  FestivalPlanTask,
} from './buildFestivalPlanChecklist';
import type { FestivalPlanTaskActions } from './festivalPlanTaskActions';

export function handleFestivalPlanTaskPress(
  task: FestivalPlanTask,
  options: {
    activityLegacyId?: number;
    checklist?: FestivalPlanChecklist | null;
    actions?: FestivalPlanTaskActions | null;
  },
): void {
  const { activityLegacyId, checklist, actions } = options;
  if (activityLegacyId == null || Number.isNaN(activityLegacyId)) return;

  if (task.done) {
    switch (task.key) {
      case 'travel_guide':
        if (checklist?.travelGuideId) {
          goAiTravelGuide(checklist.travelGuideId);
        }
        return;
      case 'itinerary':
        goExclusiveItinerary(activityLegacyId);
        return;
      case 'buddy_post':
        if (checklist?.buddyPostId) {
          goEventDetail(activityLegacyId, {
            postId: checklist.buddyPostId,
            focusPosts: true,
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
}
