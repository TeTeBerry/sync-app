import { useEventDetailFestivalPlan } from '@/domains/festival-plan';

export type UseEventDetailFestivalPlanSectionOptions = {
  activityLegacyId?: number;
  openTravelGuideSheet: () => void;
  openItinerary: () => void;
  openBuddyPostSheet: () => void;
};

export function useEventDetailFestivalPlanSection(
  options: UseEventDetailFestivalPlanSectionOptions,
) {
  return useEventDetailFestivalPlan(options);
}
