export type FestivalPlanTaskKey = 'travel_guide' | 'itinerary' | 'buddy_post';

export const FESTIVAL_PLAN_TASK_ORDER: readonly FestivalPlanTaskKey[] = [
  'travel_guide',
  'buddy_post',
  'itinerary',
] as const;

export type FestivalPlanTaskDef = {
  title: string;
  actionLabel: string;
  doneLabel: string;
  viewLabel: string;
};
