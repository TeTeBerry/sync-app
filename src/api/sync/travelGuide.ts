import {
  LONG_RUNNING_REQUEST_TIMEOUT_MS,
  apiGet,
  apiPost,
} from '../../utils/apiClient';
import type {
  AiGuidePlanFormValues,
  GenerateTravelGuideResult,
} from '../../types/travelGuide';
import { ownerQueryParams } from '../requestContext';

export type TravelGuidePlaceSuggestion = {
  title: string;
  address: string;
  city?: string;
};

export function fetchTravelGuidePlaceSuggestions(keyword: string, region?: string) {
  const params: Record<string, string> = {};
  if (keyword.trim()) params.keyword = keyword.trim();
  if (region?.trim()) params.region = region.trim();
  return apiGet<{ data: TravelGuidePlaceSuggestion[] }>(
    '/travel-guide/place-suggestions',
    params,
  );
}

export function generateTravelGuide(
  activityLegacyId: number,
  payload: AiGuidePlanFormValues,
) {
  return apiPost<GenerateTravelGuideResult>(
    `/activities/${activityLegacyId}/travel-guide/generate`,
    payload,
    ownerQueryParams(),
    { timeoutMs: LONG_RUNNING_REQUEST_TIMEOUT_MS, maxRetries: 0 },
  );
}
