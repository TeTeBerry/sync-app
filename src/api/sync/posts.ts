import { apiDelete, apiGet, apiPatch, apiPost } from '../../utils/apiClient';
import type {
  CreatePostPayload,
  EventDetailPost,
  EventPostsPage,
  HomeFeedPost,
  PostActionResult,
  PostApplicationItem,
  PostCommentItem,
  ProfilePostItem,
  UpdatePostPayload,
} from '../../types/backend';
import {
  unwrapPostMutation,
  type PostMutationResponse,
} from '../../types/contracts/postMutation';
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

export function deletePost(postId: string) {
  return apiDelete<{ ok: true }>(`/posts/${postId}`, ownerQueryParams());
}

export function createPost(payload: CreatePostPayload) {
  return apiPost<EventDetailPost>('/posts', payload, ownerQueryParams());
}

export function updatePost(postId: string, payload: UpdatePostPayload) {
  return apiPatch<ProfilePostItem>(`/posts/${postId}`, payload, ownerQueryParams());
}

export function likePost(postId: string) {
  return apiPost<PostMutationResponse | EventDetailPost>(
    `/posts/${postId}/like`,
    {},
    ownerQueryParams(),
  ).then(unwrapPostMutation);
}

export type ApplyToPostPayload = {
  message?: string;
};

export function applyToPost(postId: string, payload?: ApplyToPostPayload) {
  const body =
    payload?.message?.trim() != null && payload.message.trim() !== ''
      ? { message: payload.message.trim() }
      : {};
  return apiPost<PostActionResult>(
    `/posts/${postId}/applications`,
    body,
    ownerQueryParams(),
  );
}

export function fetchPostApplications(postId: string) {
  return apiGet<PostApplicationItem[]>(
    `/posts/${postId}/applications`,
    ownerQueryParams(),
  );
}

export function acceptPostApplication(postId: string, applicantUserId: string) {
  return apiPost<{ ok: true }>(
    `/posts/${postId}/applications/${encodeURIComponent(applicantUserId)}/accept`,
    {},
    ownerQueryParams(),
  );
}

export function fetchPostComments(postId: string) {
  return apiGet<PostCommentItem[]>(`/posts/${postId}/comments`);
}

export function addPostComment(postId: string, body: string, parentCommentId?: string) {
  return apiPost<PostMutationResponse | EventDetailPost>(
    `/posts/${postId}/comments`,
    { body, ...(parentCommentId ? { parentCommentId } : {}) },
    ownerQueryParams(),
  ).then(unwrapPostMutation);
}
