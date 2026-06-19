import {
  FESTIVAL_PLAN_TASK_DEFS,
  FESTIVAL_PLAN_TASK_ORDER,
  type FestivalPlanTaskKey,
} from './festivalPlanTaskDefs';

export type FestivalPlanTask = {
  key: FestivalPlanTaskKey;
  title: string;
  done: boolean;
  /** Primary row label — done state uses doneLabel, pending uses title. */
  label: string;
  /** Trailing CTA —「去生成」or「查看」 */
  trailingLabel: string;
  isNext: boolean;
};

export type FestivalPlanChecklist = {
  tasks: FestivalPlanTask[];
  completedCount: number;
  totalCount: number;
  nextTaskKey?: FestivalPlanTaskKey;
  travelGuideId?: string;
  itineraryDayCount?: number;
  itinerarySelectedDjIds?: string[];
  buddyPostId?: string;
};

export type FestivalPlanProgressInput = {
  hasTravelGuide: boolean;
  travelGuideId?: string;
  hasItinerary: boolean;
  itineraryDayCount?: number;
  itinerarySelectedDjIds?: string[];
  hasBuddyPost: boolean;
  buddyPostId?: string;
};

export function buildFestivalPlanChecklist(
  input: FestivalPlanProgressInput,
): FestivalPlanChecklist {
  const doneByKey: Record<FestivalPlanTaskKey, boolean> = {
    travel_guide: input.hasTravelGuide,
    itinerary: input.hasItinerary,
    buddy_post: input.hasBuddyPost,
  };

  const nextTaskKey = FESTIVAL_PLAN_TASK_ORDER.find((key) => !doneByKey[key]);
  const completedCount = FESTIVAL_PLAN_TASK_ORDER.filter(
    (key) => doneByKey[key],
  ).length;

  const tasks: FestivalPlanTask[] = FESTIVAL_PLAN_TASK_ORDER.map((key) => {
    const def = FESTIVAL_PLAN_TASK_DEFS[key];
    const done = doneByKey[key];
    let doneLabel = def.doneLabel;
    if (key === 'itinerary' && done && input.itineraryDayCount) {
      doneLabel = `${input.itineraryDayCount} 天行程`;
    }

    return {
      key,
      title: def.title,
      done,
      label: done ? doneLabel : def.title,
      trailingLabel: done ? def.viewLabel : def.actionLabel,
      isNext: key === nextTaskKey,
    };
  });

  return {
    tasks,
    completedCount,
    totalCount: FESTIVAL_PLAN_TASK_ORDER.length,
    nextTaskKey,
    travelGuideId: input.travelGuideId,
    itineraryDayCount: input.itineraryDayCount,
    itinerarySelectedDjIds: input.itinerarySelectedDjIds,
    buddyPostId: input.buddyPostId,
  };
}
