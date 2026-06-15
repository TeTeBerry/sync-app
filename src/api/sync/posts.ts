import { apiDelete, apiGet, apiPost } from '../../utils/apiClient';
import type {
  CreatePostPayload,
  EventDetailPost,
  EventPostsPage,
  HomeFeedPost,
} from '../../types/backend';
import { mergeOwnerQueryParams, ownerQueryParams } from '../requestContext';

export function fetchPopularPosts(limit = 20) {
  return apiGet<HomeFeedPost[]>(
    '/posts/popular',
    mergeOwnerQueryParams({ limit: String(limit) }),
  );
}

export type FetchPostsByActivityPageOptions = {
  limit?: number;
  cursor?: string;
  anchorPostId?: string;
};

export function fetchPostsByActivityPage(
  activityLegacyId: number,
  options?: FetchPostsByActivityPageOptions,
) {
  const params = mergeOwnerQueryParams({
    activityLegacyId: String(activityLegacyId),
    ...(options?.limit != null ? { limit: String(options.limit) } : {}),
    ...(options?.cursor ? { cursor: options.cursor } : {}),
    ...(options?.anchorPostId ? { anchorPostId: options.anchorPostId } : {}),
  });
  return apiGet<EventPostsPage>('/posts', params);
}

export async function fetchPostsByActivity(activityLegacyId: number) {
  const page = await fetchPostsByActivityPage(activityLegacyId, { limit: 20 });
  return page.items;
}

export function fetchPostNavigationTarget(postId: string) {
  return apiGet<{ postId: string; activityLegacyId: number }>(
    `/posts/${postId}/navigation-target`,
    ownerQueryParams(),
  );
}

export function createPost(payload: CreatePostPayload) {
  return apiPost<EventDetailPost>('/posts', payload, ownerQueryParams());
}

export function deletePost(postId: string) {
  return apiDelete<{ ok: true }>(`/posts/${postId}`, ownerQueryParams());
}
