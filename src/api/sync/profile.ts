import { apiGet } from '../../utils/apiClient';
import type { ProfileActivityItem, ProfileSummary } from '../../types/backend';
import { ownerQueryParams } from '../requestContext';

export function fetchProfileSummary() {
  return apiGet<ProfileSummary>('/profile', ownerQueryParams());
}

export function fetchProfileActivities() {
  return apiGet<ProfileActivityItem[]>('/profile/activities', ownerQueryParams());
}
