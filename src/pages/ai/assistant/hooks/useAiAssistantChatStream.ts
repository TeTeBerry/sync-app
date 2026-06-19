import Taro from '@tarojs/taro';
import { useAiChatStream } from '../../../../hooks/useAiChatStream';
import { invalidatePostQueries } from '../../../../hooks/useSyncApi';
import { invalidateCache } from '../../../../hooks/useApiQuery';
import { getAuthHeaders } from '../../../../utils/authStorage';
import { saveTravelGuideDetail } from '../../../../domains/travel-guide/utils/travelGuideDetailStorage';
import { getActiveActivityLegacyId } from '../../../../domains/activity-scope';
import { useItineraryStore } from '../../../../domains/performance-itinerary/store';
import type { TravelGuidePlan } from '../../../../types/travelGuide';
import { BUDDY_POST_PUBLISH_SUCCESS_MESSAGE } from '../../../../constants/ugcPublishCompliance';

export function useAiAssistantChatStream(options: {
  activityTitle?: string;
  activityLegacyId?: number;
}) {
  const { activityTitle, activityLegacyId } = options;

  return useAiChatStream({
    activityTitle,
    streamErrorText: '抱歉，回复出错了，请稍后再试。',
    activityLegacyId,
    getAuthHeaders,
    onPostCreated: async (event) => {
      await invalidatePostQueries();
      const scopedId = event.activityLegacyId ?? activityLegacyId;
      if (scopedId != null) {
        invalidateCache(['posts', 'activity', scopedId]);
      }
      void Taro.showToast({
        title: BUDDY_POST_PUBLISH_SUCCESS_MESSAGE,
        icon: 'success',
        duration: 3000,
      });
    },
    onExistingPost: () => {
      void Taro.showToast({
        title: '你已有组队帖，请去「我的」编辑或在活动详情查看',
        icon: 'none',
        duration: 2500,
      });
    },
    onTravelGuideReady: (event) => {
      const legacyId = activityLegacyId ?? getActiveActivityLegacyId() ?? undefined;
      if (legacyId == null) return;
      saveTravelGuideDetail(event.guideId, {
        plan: event.plan as unknown as TravelGuidePlan,
        form: event.form,
        activityLegacyId: legacyId,
      });
    },
    onItineraryReady: (event) => {
      useItineraryStore
        .getState()
        .setFromGenerateResult(event.activityLegacyId, event.selectedDjIds, {
          itinerary: {
            eventMeta: event.eventMeta,
            days: event.days,
          },
          conflicts: event.conflicts,
          cached: event.cached ?? false,
        });
    },
  });
}
