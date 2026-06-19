import { t } from '@/i18n';
import type { FestivalPlanTaskKey } from './festivalPlanTaskDefs';

export type FestivalPlanTaskDef = {
  title: string;
  actionLabel: string;
  doneLabel: string;
  viewLabel: string;
};

export function getFestivalPlanTaskDefs(): Record<
  FestivalPlanTaskKey,
  FestivalPlanTaskDef
> {
  return {
    travel_guide: {
      title: t('ai.travelGuideTitle'),
      actionLabel: t('ai.generateTravelGuide'),
      doneLabel: t('festivalPlan.guideDone'),
      viewLabel: t('ai.viewTravelGuide'),
    },
    itinerary: {
      title: t('ai.itineraryTitle'),
      actionLabel: t('ai.generateItinerary'),
      doneLabel: t('festivalPlan.itineraryDone'),
      viewLabel: t('ai.viewItinerary'),
    },
    buddy_post: {
      title: t('festivalPlan.buddyPostTitle'),
      actionLabel: t('ai.buddyPost'),
      doneLabel: t('festivalPlan.buddyPostDone'),
      viewLabel: t('festivalPlan.viewBuddyPost'),
    },
  };
}
