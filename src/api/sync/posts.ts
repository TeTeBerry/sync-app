import { apiDelete, apiGet, apiPatch, apiPost } from '../../utils/apiClient';
import type {
  CreatePostPayload,
  BuddyPostAiSearchResult,
  EventDetailPost,
  EventPostsPage,
  PostCommentsPage,
} from '../../types/backend';
import { mergeOwnerQueryParams, ownerQueryParams } from '../requestContext';

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

export function createPost(payload: CreatePostPayload) {
  return apiPost<EventDetailPost>('/posts', payload, ownerQueryParams());
}

export function deletePost(postId: string) {
  return apiDelete<{ ok: true }>(`/posts/${postId}`, ownerQueryParams());
}

export type UpdatePostPayload = {
  body: string;
  location?: string;
  departureCity?: string;
  tags?: string[];
  recruitStatus?: 'open' | 'full';
  slotsTotal?: number;
  slotsFilled?: number;
};

export function updatePost(postId: string, payload: UpdatePostPayload) {
  return apiPatch<EventDetailPost>(`/posts/${postId}`, payload, ownerQueryParams());
}

export type UpdatePostRecruitPayload = {
  recruitStatus: 'open' | 'full';
  slotsTotal?: number;
  slotsFilled?: number;
};

export function updatePostRecruit(postId: string, payload: UpdatePostRecruitPayload) {
  return apiPatch<EventDetailPost>(
    `/posts/${postId}/recruit`,
    payload,
    ownerQueryParams(),
  );
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

export function deletePostComment(postId: string, commentId: string) {
  return apiDelete<{ id: string; comments: number }>(
    `/posts/${postId}/comments/${commentId}`,
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
