import { useCallback } from "react";
import { useApiQuery } from "./useApiQuery";
import {
  fetchItinerarySchedule,
  fetchSavedItinerary,
  generateItinerary,
  saveItinerary,
} from "../api/syncApi";
import { isApiEnabled } from "../constants/api";
import type {
  GenerateItineraryPayload,
  SaveItineraryPayload,
} from "../types/backend";

export function useItineraryScheduleQuery(
  activityLegacyId: number | null | undefined,
  options?: { dateKey?: string; selectedDjIds?: string[] },
) {
  const enabled =
    isApiEnabled() &&
    activityLegacyId != null &&
    Number.isFinite(activityLegacyId) &&
    activityLegacyId > 0;

  const selectedKey = options?.selectedDjIds?.join(",") ?? "";

  return useApiQuery({
    queryKey: [
      "itinerary",
      "schedule",
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

export function useSavedItineraryQuery(
  activityLegacyId: number | null | undefined,
) {
  const enabled =
    isApiEnabled() &&
    activityLegacyId != null &&
    Number.isFinite(activityLegacyId) &&
    activityLegacyId > 0;

  return useApiQuery({
    queryKey: ["itinerary", "saved", activityLegacyId ?? undefined],
    queryFn: () => fetchSavedItinerary(activityLegacyId!),
    enabled,
  });
}

export function useItineraryMutations(activityLegacyId: number) {
  const generate = useCallback(
    (payload: GenerateItineraryPayload) =>
      generateItinerary(activityLegacyId, payload),
    [activityLegacyId],
  );

  const save = useCallback(
    (payload: SaveItineraryPayload) =>
      saveItinerary(activityLegacyId, payload),
    [activityLegacyId],
  );

  return { generate, save };
}
