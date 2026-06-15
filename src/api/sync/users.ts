import { apiGet, apiPatch } from '../../utils/apiClient';
import type { CurrentUser, UpdateCurrentUserPayload } from '../../types/backend';
import { ownerQueryParams } from '../requestContext';

export function fetchCurrentUser() {
  return apiGet<CurrentUser>('/users/me', ownerQueryParams());
}

export function updateCurrentUser(payload: UpdateCurrentUserPayload) {
  return apiPatch<CurrentUser>('/users/me', payload, ownerQueryParams());
}
