import { apiGet, apiPost } from '../../utils/apiClient';
import type {
  GenerateItineraryPayload,
  GenerateItineraryResult,
  ItineraryBuddyRecruitHint,
  ItineraryScheduleSnapshot,
  SaveItineraryPayload,
  SaveItineraryResult,
  SavedItineraryResult,
} from '../../types/backend';
import { mergeOwnerQueryParams, ownerQueryParams } from '../requestContext';

export function fetchItinerarySchedule(
  activityLegacyId: number,
  options?: { dateKey?: string; selectedDjIds?: string[] },
) {
  const params = mergeOwnerQueryParams();
  if (options?.dateKey) params.dateKey = options.dateKey;
  if (options?.selectedDjIds?.length) {
    params.selectedDjIds = options.selectedDjIds.join(',');
  }
  return apiGet<ItineraryScheduleSnapshot>(
    `/activities/${activityLegacyId}/itinerary/schedule`,
    params,
  );
}

export function generateItinerary(
  activityLegacyId: number,
  payload: GenerateItineraryPayload,
) {
  return apiPost<GenerateItineraryResult>(
    `/activities/${activityLegacyId}/itinerary/generate`,
    payload,
    ownerQueryParams(),
  );
}

export function saveItinerary(activityLegacyId: number, payload: SaveItineraryPayload) {
  return apiPost<SaveItineraryResult>(
    `/activities/${activityLegacyId}/itinerary/save`,
    payload,
    ownerQueryParams(),
  );
}

export function fetchSavedItinerary(activityLegacyId: number) {
  return apiGet<SavedItineraryResult>(
    `/activities/${activityLegacyId}/itinerary/saved`,
    ownerQueryParams(),
  );
}

export function fetchItineraryBuddyRecruitHint(
  activityLegacyId: number,
  selectedDjIds: string[],
) {
  const params = mergeOwnerQueryParams();
  if (selectedDjIds.length) {
    params.selectedDjIds = selectedDjIds.join(',');
  }
  return apiGet<ItineraryBuddyRecruitHint>(
    `/activities/${activityLegacyId}/itinerary/buddy-recruit-hint`,
    params,
  );
}
