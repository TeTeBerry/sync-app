import { useCallback, useMemo } from 'react';
import { runAiCapability } from '@/domains/ai-capability/runAiCapability';
import type { AiCapability } from '@/domains/ai-capability/types';
import {
  goEventDetail,
  goExclusiveItinerary,
  goAiAssistantTravelGuideSheet,
} from '@/utils/route';
import { useFestivalPlanSummary } from '../useFestivalPlanSummary';
import { useFestivalPlanNavigation } from '../useFestivalPlanNavigation';
import type { FestivalPlanTaskActions } from '../festivalPlanTaskActions';

export function useHomeFestivalPlanNavigation(activityLegacyId?: number) {
  const checklist = useFestivalPlanSummary(activityLegacyId);

  const actions = useMemo<FestivalPlanTaskActions>(
    () => ({
      runCapability: (capability: AiCapability) => {
        if (activityLegacyId == null || Number.isNaN(activityLegacyId)) {
          return;
        }
        runAiCapability(capability, {
          openTravelGuideSheet: () => {
            goAiAssistantTravelGuideSheet(activityLegacyId);
          },
          openItinerary: () => {
            goExclusiveItinerary(activityLegacyId);
          },
          openBuddyPostSheet: () => {
            goEventDetail(activityLegacyId, {
              openBuddyPost: true,
              focusPosts: true,
            });
          },
        });
      },
      openBuddyPostSheet: () => {
        goEventDetail(activityLegacyId, {
          openBuddyPost: true,
          focusPosts: true,
        });
      },
    }),
    [activityLegacyId],
  );

  const onTaskPress = useFestivalPlanNavigation(activityLegacyId, checklist, actions);

  const openFestivalPlanHub = useCallback(() => {
    if (activityLegacyId == null || Number.isNaN(activityLegacyId)) {
      return;
    }
    goEventDetail(activityLegacyId);
  }, [activityLegacyId]);

  return {
    checklist,
    onTaskPress,
    openFestivalPlanHub,
  };
}
