import {
  getGenerateTravelGuideCta,
  getTravelGuideTitle,
  getViewTravelGuideCta,
} from '@/constants/aiCtaLabels';
import type {
  FestivalPlanChecklist,
  FestivalPlanTask,
} from '@/domains/festival-plan/buildFestivalPlanChecklist';

export type EventDetailPrepStep = {
  key: string;
  label: string;
  actionLabel: string;
  done: boolean;
  isNext: boolean;
  displayOnly?: boolean;
  onClick: () => void;
};

export type BuildEventDetailPrepStepsInput = {
  travelGuideGenerated?: boolean;
  checklist?: FestivalPlanChecklist | null;
  showFestivalPlan?: boolean;
  onAiGuideClick: () => void;
  onOpenExclusiveItinerary: () => void;
  onFestivalPlanTaskPress?: (task: FestivalPlanTask) => void;
  t: (key: string, params?: Record<string, string>) => string;
};

function taskFromChecklist(
  checklist: FestivalPlanChecklist | null | undefined,
  key: FestivalPlanTask['key'],
): FestivalPlanTask | undefined {
  return checklist?.tasks.find((task) => task.key === key);
}

/** Lineup browsing lives on the info card CTA; prep only tracks personal tasks. */
export function buildEventDetailPrepSteps({
  travelGuideGenerated = false,
  checklist,
  showFestivalPlan = false,
  onAiGuideClick,
  onOpenExclusiveItinerary,
  onFestivalPlanTaskPress,
  t,
}: BuildEventDetailPrepStepsInput): EventDetailPrepStep[] {
  const travelTask = taskFromChecklist(checklist, 'travel_guide');
  const itineraryTask = taskFromChecklist(checklist, 'itinerary');
  const buddyTask = taskFromChecklist(checklist, 'buddy_post');
  const travelDone = showFestivalPlan
    ? Boolean(travelTask?.done)
    : travelGuideGenerated;

  const steps: EventDetailPrepStep[] = [
    {
      key: 'travel_guide',
      label: getTravelGuideTitle(),
      actionLabel: travelDone ? getViewTravelGuideCta() : getGenerateTravelGuideCta(),
      done: travelDone,
      isNext: showFestivalPlan ? Boolean(travelTask?.isNext) : false,
      onClick: () => {
        if (showFestivalPlan && travelTask && onFestivalPlanTaskPress) {
          onFestivalPlanTaskPress(travelTask);
          return;
        }
        onAiGuideClick();
      },
    },
  ];

  if (showFestivalPlan && itineraryTask) {
    steps.push({
      key: 'exclusive_itinerary',
      label: itineraryTask.label,
      actionLabel: itineraryTask.trailingLabel,
      done: itineraryTask.done,
      isNext: itineraryTask.isNext,
      onClick: () => {
        if (onFestivalPlanTaskPress) {
          onFestivalPlanTaskPress(itineraryTask);
          return;
        }
        onOpenExclusiveItinerary();
      },
    });
  }

  if (showFestivalPlan && buddyTask) {
    steps.push({
      key: 'buddy_post',
      label: buddyTask.done
        ? t('festivalPlan.buddyPostDone')
        : t('festivalPlan.buddyPostTitle'),
      actionLabel: '',
      done: buddyTask.done,
      isNext: buddyTask.isNext,
      displayOnly: true,
      onClick: () => {},
    });
  }

  return steps;
}
