import { useMemo } from 'react';
import { useLocale } from '@/hooks/useI18n';
import { useFestivalPlanProgressQuery } from '@/hooks/sync/festivalPlanProgress';
import { useItineraryStore } from '@/domains/performance-itinerary/store';
import { findLatestTravelGuideForActivity } from '@/domains/travel-guide/utils/travelGuideDetailStorage';
import {
  buildFestivalPlanChecklist,
  type FestivalPlanChecklist,
} from './buildFestivalPlanChecklist';
import { mergeFestivalPlanProgressInput } from './mergeFestivalPlanProgressInput';

export type {
  FestivalPlanTask,
  FestivalPlanChecklist,
} from './buildFestivalPlanChecklist';
export type { FestivalPlanTaskKey } from './festivalPlanTaskDefs';

export function useFestivalPlanSummary(
  activityLegacyId?: number,
  refreshKey = 0,
): FestivalPlanChecklist | null {
  const progressQuery = useFestivalPlanProgressQuery(activityLegacyId);
  const pendingItinerary = useItineraryStore((state) => state.pending);
  const locale = useLocale();

  return useMemo(() => {
    if (activityLegacyId == null || Number.isNaN(activityLegacyId)) {
      return null;
    }

    void refreshKey;
    void locale;

    const storedGuide = findLatestTravelGuideForActivity(activityLegacyId);
    const localTravelGuideId = storedGuide?.guideId;

    let localItineraryDayCount: number | undefined;
    let localItinerarySelectedDjIds: string[] | undefined;
    let localHasItinerary = false;
    const pending =
      pendingItinerary?.activityLegacyId === activityLegacyId ? pendingItinerary : null;
    if (pending?.days?.length) {
      localHasItinerary = true;
      localItineraryDayCount = pending.days.length;
      localItinerarySelectedDjIds = pending.selectedDjIds;
    }

    return buildFestivalPlanChecklist(
      mergeFestivalPlanProgressInput(progressQuery.data, {
        travelGuideId: localTravelGuideId,
        hasItinerary: localHasItinerary,
        itineraryDayCount: localItineraryDayCount,
        itinerarySelectedDjIds: localItinerarySelectedDjIds,
      }),
    );
  }, [activityLegacyId, locale, pendingItinerary, progressQuery.data, refreshKey]);
}
