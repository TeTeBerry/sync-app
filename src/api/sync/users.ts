import { apiGet, apiPatch } from '../../utils/apiClient';
import type { CurrentUser, UpdateCurrentUserPayload } from '../../types/backend';
import {
  normalizeCurrentUserProfile,
  normalizeUpdateCurrentUserPayload,
} from '../../utils/normalizeUserProfileText';
import { ownerQueryParams } from '../requestContext';

export async function fetchCurrentUser() {
  const user = await apiGet<CurrentUser>('/users/me', ownerQueryParams());
  return normalizeCurrentUserProfile(user);
}

export async function updateCurrentUser(payload: UpdateCurrentUserPayload) {
  const user = await apiPatch<CurrentUser>(
    '/users/me',
    normalizeUpdateCurrentUserPayload(payload),
    ownerQueryParams(),
  );
  return normalizeCurrentUserProfile(user);
}
