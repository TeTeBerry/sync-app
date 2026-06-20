import { apiGet } from '../../utils/apiClient';
import type {
  ProfileActivityItem,
  ProfilePostItem,
  ProfilePostsPage,
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

export type FetchProfilePostsPageOptions = {
  limit?: number;
  cursor?: string;
};

export function fetchProfilePostsPage(options?: FetchProfilePostsPageOptions) {
  const params = ownerQueryParams();
  if (options?.limit != null) {
    params.limit = String(options.limit);
  }
  if (options?.cursor) {
    params.cursor = options.cursor;
  }
  return apiGet<ProfilePostsPage>('/profile/posts', params);
}

export function fetchUserPosts(ownerUserId: string, ownerAuthorName?: string) {
  const params: Record<string, string> = { userId: ownerUserId.trim() };
  const name = ownerAuthorName?.trim();
  if (name) {
    params.authorName = name;
  }
  return apiGet<ProfilePostItem[]>('/profile/posts', params);
}
