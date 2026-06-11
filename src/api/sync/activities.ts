import { apiDelete, apiGet, apiPost } from '../../utils/apiClient';
import type {
  ActivityRegistrationResult,
  ActivityUnregisterResult,
  BackendActivity,
  HomeSummary,
} from '../../types/backend';
import { ownerQueryParams } from '../requestContext';

export function fetchActivities() {
  return apiGet<BackendActivity[]>('/activities');
}

export function resolveActivityByKeyword(keyword: string) {
  return apiGet<BackendActivity | null>('/activities/resolve', { keyword });
}

export function fetchHomeSummary() {
  return apiGet<HomeSummary>('/home', ownerQueryParams());
}

export function fetchActivityByLegacyId(legacyId: number) {
  return apiGet<BackendActivity | null>(`/activities/${legacyId}`);
}

export function registerForActivity(legacyId: number) {
  return apiPost<ActivityRegistrationResult>(
    `/activities/${legacyId}/register`,
    {},
    ownerQueryParams(),
  );
}

export function cancelActivityRegistration(legacyId: number) {
  return apiDelete<ActivityUnregisterResult>(
    `/activities/${legacyId}/register`,
    ownerQueryParams(),
  );
}
