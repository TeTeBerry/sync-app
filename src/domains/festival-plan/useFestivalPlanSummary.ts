import { useMemo } from 'react';
import { useRegisteredActivityLegacyIds } from '@/hooks/sync/activities';
import { useProfilePostsQuery } from '@/hooks/sync/profile';
import { useSavedItineraryQuery } from '@/hooks/useItineraryApi';
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

export type {
  FestivalPlanTask,
  FestivalPlanChecklist,
} from './buildFestivalPlanChecklist';
export type { FestivalPlanTaskKey } from './festivalPlanTaskDefs';

export function useFestivalPlanSummary(
  activityLegacyId?: number,
  refreshKey = 0,
): FestivalPlanChecklist | null {
  const registeredLegacyIds = useRegisteredActivityLegacyIds();
  const savedItineraryQuery = useSavedItineraryQuery(activityLegacyId);
  const profilePostsQuery = useProfilePostsQuery();
  const pendingItinerary = useItineraryStore((state) => state.pending);

  return useMemo(() => {
    if (activityLegacyId == null || Number.isNaN(activityLegacyId)) {
      return null;
    }

    void refreshKey;

    const scopeMessages = useAiChatStore
      .getState()
      .getScopeMessages(buildAiChatScopeKey(activityLegacyId));

    let travelGuideId: string | undefined;
    const storedGuide = findLatestTravelGuideForActivity(activityLegacyId);
    if (storedGuide) {
      travelGuideId = storedGuide.guideId;
    } else {
      travelGuideId = findTravelGuideInChatMessages(scopeMessages)?.guideId;
    }

    let itineraryDayCount: number | undefined;
    let itinerarySelectedDjIds: string[] | undefined;
    const pending =
      pendingItinerary?.activityLegacyId === activityLegacyId ? pendingItinerary : null;
    const saved = savedItineraryQuery.data;
    const itineraryDays = pending?.days?.length
      ? pending.days
      : saved?.saved && saved.days?.length
        ? saved.days
        : null;

    const hasItinerary = Boolean(itineraryDays?.length);
    if (hasItinerary) {
      itineraryDayCount = itineraryDays!.length;
      itinerarySelectedDjIds = pending?.selectedDjIds?.length
        ? pending.selectedDjIds
        : saved?.selectedDjIds;
    }

    let buddyPostId: string | undefined;
    const profilePost = profilePostsQuery.data?.find(
      (post) => post.activityLegacyId === activityLegacyId,
    );
    if (profilePost?.id) {
      buddyPostId = profilePost.id;
    } else {
      buddyPostId = findBuddyPostInChatMessages(scopeMessages)?.postId;
    }

    const isRegistered =
      registeredLegacyIds.has(activityLegacyId) ||
      hasRegisteredActivityInChatMessages(scopeMessages, activityLegacyId);

    return buildFestivalPlanChecklist({
      hasTravelGuide: Boolean(travelGuideId),
      travelGuideId,
      hasItinerary,
      itineraryDayCount,
      itinerarySelectedDjIds,
      hasBuddyPost: Boolean(buddyPostId),
      buddyPostId,
      isRegistered,
    });
  }, [
    activityLegacyId,
    pendingItinerary,
    profilePostsQuery.data,
    refreshKey,
    registeredLegacyIds,
    savedItineraryQuery.data,
  ]);
}
