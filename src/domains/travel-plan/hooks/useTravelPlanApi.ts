import { useCallback } from 'react';
import { fetchSavedTravelPlan, saveTravelPlan } from '@/api/syncApi';
import { isLiveApi } from '@/constants/api';
import type { SaveTravelPlanPayload } from '@/types/travelPlan';
import { invalidateCache, useApiQuery } from '@/hooks/useApiQuery';
import { refreshMyActivitiesAfterEngagement } from '@/stores/activitySubscriptionActions';

export function useSavedTravelPlanQuery(activityLegacyId: number | null | undefined) {
  const enabled =
    isLiveApi() &&
    activityLegacyId != null &&
    Number.isFinite(activityLegacyId) &&
    activityLegacyId > 0;

  return useApiQuery({
    queryKey: ['travel-plan', 'saved', activityLegacyId ?? undefined],
    queryFn: () => fetchSavedTravelPlan(activityLegacyId!),
    enabled,
  });
}

export function useTravelPlanMutations(activityLegacyId: number) {
  const save = useCallback(
    async (payload: SaveTravelPlanPayload) => {
      const result = await saveTravelPlan(activityLegacyId, payload);
      invalidateCache(['travel-plan', 'saved', activityLegacyId]);
      void refreshMyActivitiesAfterEngagement();
      return result;
    },
    [activityLegacyId],
  );

  return { save };
}
