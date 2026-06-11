import { apiGet } from '../../utils/apiClient';
import type {
  ProfileActivityItem,
  ProfilePostItem,
  ProfileSummary,
} from '../../types/backend';
import { ownerQueryParams } from '../requestContext';

export function fetchProfileSummary() {
  return apiGet<ProfileSummary>('/profile', ownerQueryParams());
}

export function fetchProfileActivities() {
  return apiGet<ProfileActivityItem[]>('/profile/activities', ownerQueryParams());
}

export function fetchProfilePosts() {
  return apiGet<ProfilePostItem[]>('/profile/posts', ownerQueryParams());
}

export function fetchUserPosts(ownerUserId: string, ownerAuthorName?: string) {
  const params: Record<string, string> = { userId: ownerUserId.trim() };
  const name = ownerAuthorName?.trim();
  if (name) {
    params.authorName = name;
  }
  return apiGet<ProfilePostItem[]>('/profile/posts', params);
}
