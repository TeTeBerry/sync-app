import type { FestivalPlanProgressDto } from '@/types/festivalPlan';
import type { FestivalPlanProgressInput } from './buildFestivalPlanChecklist';

/** Merge server BFF progress with optimistic/local-only signals. */
export function mergeFestivalPlanProgressInput(
  server: FestivalPlanProgressDto | undefined,
  local: Partial<FestivalPlanProgressInput>,
): FestivalPlanProgressInput {
  const travelGuideId = local.travelGuideId ?? server?.travelGuideId;
  const buddyPostId = local.buddyPostId ?? server?.buddyPostId;

  const hasItinerary = Boolean(local.hasItinerary) || Boolean(server?.hasItinerary);
  const itineraryDayCount = local.itineraryDayCount ?? server?.itineraryDayCount;
  const itinerarySelectedDjIds =
    local.itinerarySelectedDjIds ?? server?.itinerarySelectedDjIds;

  return {
    hasTravelGuide: Boolean(travelGuideId),
    travelGuideId,
    hasItinerary,
    itineraryDayCount,
    itinerarySelectedDjIds,
    hasBuddyPost: Boolean(buddyPostId),
    buddyPostId,
  };
}
