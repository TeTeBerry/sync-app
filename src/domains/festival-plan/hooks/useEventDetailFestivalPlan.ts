import { useMemo, useState } from 'react';
import { useDidShow } from '@tarojs/taro';
import { runAiCapability } from '@/domains/ai-capability/runAiCapability';
import type { AiCapability } from '@/domains/ai-capability/types';
import { invalidateCache } from '@/hooks/useApiQuery';
import { useFestivalPlanSummary } from '../useFestivalPlanSummary';
import { useFestivalPlanNavigation } from '../useFestivalPlanNavigation';
import type { FestivalPlanTaskActions } from '../festivalPlanTaskActions';

export type UseEventDetailFestivalPlanParams = {
  activityLegacyId?: number;
  openTravelGuideSheet: () => void;
  openItinerary: () => void;
  openBuddyPostSheet: () => void;
};

export function useEventDetailFestivalPlan({
  activityLegacyId,
  openTravelGuideSheet,
  openItinerary,
  openBuddyPostSheet,
}: UseEventDetailFestivalPlanParams) {
  const [refreshKey, setRefreshKey] = useState(0);

  useDidShow(() => {
    setRefreshKey((key) => key + 1);
    if (activityLegacyId != null && !Number.isNaN(activityLegacyId)) {
      invalidateCache(['festival-plan', 'progress', activityLegacyId]);
    }
  });

  const checklist = useFestivalPlanSummary(activityLegacyId, refreshKey);

  const actions = useMemo<FestivalPlanTaskActions>(
    () => ({
      runCapability: (capability: AiCapability) => {
        runAiCapability(capability, {
          openTravelGuideSheet,
          openItinerary,
          openBuddyPostSheet,
        });
      },
    }),
    [openBuddyPostSheet, openItinerary, openTravelGuideSheet],
  );

  const onTaskPress = useFestivalPlanNavigation(activityLegacyId, checklist, actions);

  const allComplete = checklist != null && !checklist.nextTaskKey;

  return {
    checklist,
    onTaskPress,
    allComplete,
  };
}
