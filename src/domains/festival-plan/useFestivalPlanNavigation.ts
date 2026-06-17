import { useCallback } from 'react';
import Taro from '@tarojs/taro';
import {
  goAiTravelGuide,
  goEventDetail,
  goMyItinerary,
  goPersonalityTest,
  ROUTES,
} from '@/utils/route';
import type { FestivalPlanChip } from './useFestivalPlanSummary';

export function useFestivalPlanNavigation(
  activityLegacyId?: number,
  summary?: {
    travelGuideId?: string;
    itinerarySelectedDjIds?: string[];
    buddyPostId?: string;
  } | null,
) {
  return useCallback(
    (chip: FestivalPlanChip) => {
      if (activityLegacyId == null || Number.isNaN(activityLegacyId)) return;

      switch (chip.key) {
        case 'travel_guide':
          if (summary?.travelGuideId) {
            goAiTravelGuide(summary.travelGuideId);
          } else {
            void Taro.showToast({ title: '请先生成出行攻略', icon: 'none' });
          }
          return;
        case 'itinerary':
          goMyItinerary(activityLegacyId, summary?.itinerarySelectedDjIds);
          return;
        case 'buddy_post':
          if (summary?.buddyPostId) {
            goEventDetail(activityLegacyId, { postId: summary.buddyPostId });
          } else {
            void Taro.navigateTo({ url: ROUTES.PROFILE_POSTS });
          }
          return;
        case 'registration':
          goEventDetail(activityLegacyId);
          return;
        case 'personality':
          goPersonalityTest({ viewResult: true });
          return;
      }
    },
    [
      activityLegacyId,
      summary?.buddyPostId,
      summary?.itinerarySelectedDjIds,
      summary?.travelGuideId,
    ],
  );
}
