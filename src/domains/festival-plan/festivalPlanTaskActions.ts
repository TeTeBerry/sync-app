import type { FestivalPlanTask } from './buildFestivalPlanChecklist';

export type FestivalPlanTaskActions = {
  openTravelGuideSheet: () => void;
  openItinerarySheet: () => void;
  openBuddyPostSheet: () => void;
};

export type FestivalPlanTaskPressHandler = (task: FestivalPlanTask) => void;
