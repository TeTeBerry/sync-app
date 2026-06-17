import { useMemo } from 'react';
import { useRegisteredActivityLegacyIds } from '@/hooks/sync/activities';
import { useProfilePostsQuery } from '@/hooks/sync/profile';
import { useSavedItineraryQuery } from '@/hooks/useItineraryApi';
import { useItineraryStore } from '@/domains/performance-itinerary/store';
import { findLatestTravelGuideForActivity } from '@/domains/travel-guide/utils/travelGuideDetailStorage';
import { loadPersonalityTestResult } from '@/domains/personality-test/utils/personalityTestStorage';
import { useAiChatStore } from '@/stores/aiChatStore';
import { buildAiChatScopeKey } from '@/utils/aiChatScope';
import {
  findBuddyPostInChatMessages,
  findTravelGuideInChatMessages,
  hasRegisteredActivityInChatMessages,
} from './festivalPlanFromChat';

export type FestivalPlanChip = {
  key: 'travel_guide' | 'itinerary' | 'buddy_post' | 'registration' | 'personality';
  label: string;
};

export type FestivalPlanSummary = {
  chips: FestivalPlanChip[];
  hasAnyPlan: boolean;
  travelGuideId?: string;
  itineraryDayCount?: number;
  itinerarySelectedDjIds?: string[];
  buddyPostId?: string;
  isRegistered: boolean;
  hasPersonalityResult: boolean;
};

export function useFestivalPlanSummary(
  activityLegacyId?: number,
  refreshKey = 0,
): FestivalPlanSummary | null {
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

    const chips: FestivalPlanChip[] = [];

    let travelGuideId: string | undefined;
    const storedGuide = findLatestTravelGuideForActivity(activityLegacyId);
    if (storedGuide) {
      travelGuideId = storedGuide.guideId;
      chips.push({ key: 'travel_guide', label: '攻略已生成' });
    } else {
      const fromChat = findTravelGuideInChatMessages(scopeMessages);
      if (fromChat) {
        travelGuideId = fromChat.guideId;
        chips.push({ key: 'travel_guide', label: '攻略已生成' });
      }
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

    if (itineraryDays?.length) {
      itineraryDayCount = itineraryDays.length;
      itinerarySelectedDjIds = pending?.selectedDjIds?.length
        ? pending.selectedDjIds
        : saved?.selectedDjIds;
      chips.push({
        key: 'itinerary',
        label: `${itineraryDayCount} 天行程`,
      });
    }

    let buddyPostId: string | undefined;
    const profilePost = profilePostsQuery.data?.find(
      (post) => post.activityLegacyId === activityLegacyId,
    );
    if (profilePost?.id) {
      buddyPostId = profilePost.id;
      chips.push({ key: 'buddy_post', label: '组队帖已发' });
    } else {
      const fromChat = findBuddyPostInChatMessages(scopeMessages);
      if (fromChat) {
        buddyPostId = fromChat.postId;
        chips.push({ key: 'buddy_post', label: '组队帖已发' });
      }
    }

    const isRegistered =
      registeredLegacyIds.has(activityLegacyId) ||
      hasRegisteredActivityInChatMessages(scopeMessages, activityLegacyId);
    if (isRegistered) {
      chips.push({ key: 'registration', label: '已报名' });
    }

    const hasPersonalityResult = Boolean(loadPersonalityTestResult());
    if (hasPersonalityResult) {
      chips.push({ key: 'personality', label: '人格已测' });
    }

    return {
      chips,
      hasAnyPlan: chips.length > 0,
      travelGuideId,
      itineraryDayCount,
      itinerarySelectedDjIds,
      buddyPostId,
      isRegistered,
      hasPersonalityResult,
    };
  }, [
    activityLegacyId,
    pendingItinerary,
    profilePostsQuery.data,
    refreshKey,
    registeredLegacyIds,
    savedItineraryQuery.data,
  ]);
}
