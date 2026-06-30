import { useCallback } from 'react';
import { useApiQuery } from './useApiQuery';
import {
  fetchItinerarySchedule,
  fetchSavedItinerary,
  generateItinerary,
  saveItinerary,
} from '../api/syncApi';
import { isLiveApi } from '../constants/api';
import { refreshMyActivitiesAfterEngagement } from '../stores/activitySubscriptionActions';
import type { GenerateItineraryPayload, SaveItineraryPayload } from '../types/backend';

export function useItineraryScheduleQuery(
  activityLegacyId: number | null | undefined,
  options?: { dateKey?: string; selectedDjIds?: string[] },
) {
  const enabled =
    isLiveApi() &&
    activityLegacyId != null &&
    Number.isFinite(activityLegacyId) &&
    activityLegacyId > 0;

  const selectedKey = options?.selectedDjIds?.join(',') ?? '';

  return useApiQuery({
    queryKey: [
      'itinerary',
      'schedule',
      activityLegacyId ?? undefined,
      options?.dateKey,
      selectedKey,
    ],
    queryFn: () =>
      fetchItinerarySchedule(activityLegacyId!, {
        dateKey: options?.dateKey,
        selectedDjIds: options?.selectedDjIds,
      }),
    enabled,
  });
}

export function useSavedItineraryQuery(activityLegacyId: number | null | undefined) {
  const enabled =
    isLiveApi() &&
    activityLegacyId != null &&
    Number.isFinite(activityLegacyId) &&
    activityLegacyId > 0;

  return useApiQuery({
    queryKey: ['itinerary', 'saved', activityLegacyId ?? undefined],
    queryFn: () => fetchSavedItinerary(activityLegacyId!),
    enabled,
  });
}

export function useItineraryMutations(activityLegacyId: number) {
  const generate = useCallback(
    (payload: GenerateItineraryPayload) => generateItinerary(activityLegacyId, payload),
    [activityLegacyId],
  );

  const save = useCallback(
    async (payload: SaveItineraryPayload) => {
      const result = await saveItinerary(activityLegacyId, payload);
      void refreshMyActivitiesAfterEngagement();
      return result;
    },
    [activityLegacyId],
  );

  return { generate, save };
}
