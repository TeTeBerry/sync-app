import { apiDelete, apiGet, apiPatch, apiPost } from '../../utils/apiClient';
import type {
  CreatePostPayload,
  EventDetailPost,
  EventPostsPage,
  HomeFeedPost,
  PostActionResult,
  PostCommentItem,
  ProfilePostItem,
  UpdatePostPayload,
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
  return apiPost<EventDetailPost>(`/posts/${postId}/like`, {}, ownerQueryParams());
}

export function applyToPost(postId: string) {
  return apiPost<PostActionResult>(
    `/posts/${postId}/applications`,
    {},
    ownerQueryParams(),
  );
}

export function fetchPostComments(postId: string) {
  return apiGet<PostCommentItem[]>(`/posts/${postId}/comments`);
}

export function addPostComment(postId: string, body: string, parentCommentId?: string) {
  return apiPost<EventDetailPost>(
    `/posts/${postId}/comments`,
    { body, ...(parentCommentId ? { parentCommentId } : {}) },
    ownerQueryParams(),
  );
}
