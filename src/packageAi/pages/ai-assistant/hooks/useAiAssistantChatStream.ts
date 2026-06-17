import Taro from '@tarojs/taro';
import { useAiChatStream } from '../../../../hooks/useAiChatStream';
import { invalidatePostQueries } from '../../../../hooks/useSyncApi';
import { invalidateCache } from '../../../../hooks/useApiQuery';
import { getAuthHeaders } from '../../../../utils/authStorage';
import { saveTravelGuideDetail } from '../../../../domains/travel-guide/utils/travelGuideDetailStorage';
import { useItineraryStore } from '../../../../domains/performance-itinerary/store';
import type { TravelGuidePlan } from '../../../../types/travelGuide';

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
        title: '组队帖已发布',
        icon: 'success',
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
      if (activityLegacyId == null) return;
      saveTravelGuideDetail(event.guideId, {
        plan: event.plan as unknown as TravelGuidePlan,
        form: event.form,
        activityLegacyId,
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
