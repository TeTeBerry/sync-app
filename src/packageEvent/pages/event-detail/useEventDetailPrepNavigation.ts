import { useCallback } from 'react';
import { scrollElementToCenter } from '../../../utils/scrollToCenter';
import { EVENT_DETAIL_SCROLL_ID, type PrepNudgeAction } from '@/domains/partner-feed';
import type { FestivalPlanChecklist, FestivalPlanTask } from '@/domains/festival-plan';

export type UseEventDetailPrepNavigationOptions = {
  setScrollTop: (value: number | undefined) => void;
  scrollToPost: (postId: string) => void;
  openPostComments: (postId: string) => void;
  openBuddyPostSheet: () => void;
  openExclusiveItinerary: () => void;
  openAiGuide: () => void;
  festivalPlanChecklist: FestivalPlanChecklist | null | undefined;
  onFestivalPlanTaskPress: (task: FestivalPlanTask) => void;
};

export function useEventDetailPrepNavigation({
  setScrollTop,
  scrollToPost,
  openPostComments,
  openBuddyPostSheet,
  openExclusiveItinerary,
  openAiGuide,
  festivalPlanChecklist,
  onFestivalPlanTaskPress,
}: UseEventDetailPrepNavigationOptions) {
  const handlePrepNudgeAction = useCallback(
    (action: PrepNudgeAction) => {
      switch (action.type) {
        case 'open_post_replies':
          scrollToPost(action.postId);
          openPostComments(action.postId);
          return;
        case 'open_buddy_post_sheet':
          openBuddyPostSheet();
          return;
        case 'scroll_to_recruits':
          void scrollElementToCenter(
            `#${EVENT_DETAIL_SCROLL_ID}`,
            '#event-detail-posts',
            setScrollTop,
          );
          return;
        case 'open_itinerary':
          openExclusiveItinerary();
          return;
        case 'open_travel_guide':
          openAiGuide();
          return;
        case 'festival_plan_task': {
          const task = festivalPlanChecklist?.tasks.find(
            (item) => item.key === action.taskKey,
          );
          if (task) {
            onFestivalPlanTaskPress(task);
          }
          return;
        }
        case 'scroll_to_subscribe':
          void scrollElementToCenter(
            `#${EVENT_DETAIL_SCROLL_ID}`,
            '#event-detail-info',
            setScrollTop,
          );
          return;
      }
    },
    [
      festivalPlanChecklist,
      openAiGuide,
      openBuddyPostSheet,
      openExclusiveItinerary,
      onFestivalPlanTaskPress,
      openPostComments,
      scrollToPost,
      setScrollTop,
    ],
  );

  return { handlePrepNudgeAction };
}
