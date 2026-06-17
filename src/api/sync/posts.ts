import { apiDelete, apiGet, apiPost } from '../../utils/apiClient';
import type {
  CreatePostPayload,
  BuddyPostAiSearchResult,
  EventDetailPost,
  EventPostsPage,
  HomeFeedPost,
  PostCommentsPage,
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

export function createPost(payload: CreatePostPayload) {
  return apiPost<EventDetailPost>('/posts', payload, ownerQueryParams());
}

export function deletePost(postId: string) {
  return apiDelete<{ ok: true }>(`/posts/${postId}`, ownerQueryParams());
}

export type FetchPostCommentsOptions = {
  limit?: number;
  cursor?: string;
};

export function fetchPostComments(postId: string, options?: FetchPostCommentsOptions) {
  const params: Record<string, string> = {};
  if (options?.limit != null) {
    params.limit = String(options.limit);
  }
  if (options?.cursor) {
    params.cursor = options.cursor;
  }
  return apiGet<PostCommentsPage>(
    `/posts/${postId}/comments`,
    Object.keys(params).length ? params : undefined,
  );
}

export function addPostComment(postId: string, body: string, parentCommentId?: string) {
  return apiPost<{ id: string; comments: number }>(
    `/posts/${postId}/comments`,
    { body, ...(parentCommentId ? { parentCommentId } : {}) },
    ownerQueryParams(),
  );
}

export function searchBuddyPostsWithAi(query: string, activityLegacyId: number) {
  return apiPost<BuddyPostAiSearchResult>(
    '/posts/ai-search',
    { query, activityLegacyId },
    ownerQueryParams(),
  );
}
