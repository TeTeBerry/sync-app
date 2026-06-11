import { useCallback } from 'react';
import { fetchSavedTravelPlan, saveTravelPlan } from '../api/syncApi';
import { isLiveApi } from '../constants/api';
import type { SaveTravelPlanPayload } from '../types/backend';
import { useApiQuery } from './useApiQuery';

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
    (payload: SaveTravelPlanPayload) => saveTravelPlan(activityLegacyId, payload),
    [activityLegacyId],
  );

  return { save };
}
