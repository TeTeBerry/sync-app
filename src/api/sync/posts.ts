import { apiDelete, apiGet, apiPatch, apiPost } from '../../utils/apiClient';
import type {
  CreatePostPayload,
  DeletePostResult,
  EventDetailPost,
  EventPostsPage,
  PostCommentMutationResult,
  PostCommentsPage,
  UpdatePostPayload,
  UpdatePostRecruitPayload,
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
  return apiDelete<DeletePostResult>(`/posts/${postId}`, ownerQueryParams());
}

export function updatePost(postId: string, payload: UpdatePostPayload) {
  return apiPatch<EventDetailPost>(`/posts/${postId}`, payload, ownerQueryParams());
}

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
  return apiPost<PostCommentMutationResult>(
    `/posts/${postId}/comments`,
    { body, ...(parentCommentId ? { parentCommentId } : {}) },
    ownerQueryParams(),
  );
}

export function deletePostComment(postId: string, commentId: string) {
  return apiDelete<PostCommentMutationResult>(
    `/posts/${postId}/comments/${commentId}`,
    ownerQueryParams(),
  );
}
