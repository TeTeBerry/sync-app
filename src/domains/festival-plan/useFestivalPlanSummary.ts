import { useMemo } from 'react';
import { useFestivalPlanProgressQuery } from '@/hooks/sync/festivalPlanProgress';
import { useItineraryStore } from '@/domains/performance-itinerary/store';
import { findLatestTravelGuideForActivity } from '@/domains/travel-guide/utils/travelGuideDetailStorage';
import { useAiChatStore } from '@/stores/aiChatStore';
import { buildAiChatScopeKey } from '@/utils/aiChatScope';
import {
  buildFestivalPlanChecklist,
  type FestivalPlanChecklist,
} from './buildFestivalPlanChecklist';
import {
  findBuddyPostInChatMessages,
  findTravelGuideInChatMessages,
  hasRegisteredActivityInChatMessages,
} from './festivalPlanFromChat';
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

  return useMemo(() => {
    if (activityLegacyId == null || Number.isNaN(activityLegacyId)) {
      return null;
    }

    void refreshKey;

    const scopeMessages = useAiChatStore
      .getState()
      .getScopeMessages(buildAiChatScopeKey(activityLegacyId));

    let localTravelGuideId: string | undefined;
    const storedGuide = findLatestTravelGuideForActivity(activityLegacyId);
    if (storedGuide) {
      localTravelGuideId = storedGuide.guideId;
    } else {
      localTravelGuideId = findTravelGuideInChatMessages(scopeMessages)?.guideId;
    }

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

    const localBuddyPostId = findBuddyPostInChatMessages(scopeMessages)?.postId;
    const localIsRegistered = hasRegisteredActivityInChatMessages(
      scopeMessages,
      activityLegacyId,
    );

    return buildFestivalPlanChecklist(
      mergeFestivalPlanProgressInput(progressQuery.data, {
        travelGuideId: localTravelGuideId,
        hasItinerary: localHasItinerary,
        itineraryDayCount: localItineraryDayCount,
        itinerarySelectedDjIds: localItinerarySelectedDjIds,
        buddyPostId: localBuddyPostId,
        isRegistered: localIsRegistered,
      }),
    );
  }, [activityLegacyId, pendingItinerary, progressQuery.data, refreshKey]);
}
