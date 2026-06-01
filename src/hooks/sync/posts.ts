import {
  addPostComment,
  applyToPost,
  deletePost,
  fetchPostComments,
  fetchPostsByActivity,
  fetchPopularPosts,
  likePost,
  updatePost,
} from '../../api/sync/posts';
import { blockUser } from '../../api/sync/users';
import { resolveRequestUserId } from '../../api/requestContext';
import type { HomeFeedPost } from '../../types/backend';
import { isApiEnabled } from '../../constants/api';
import {
  HOME_POPULAR_POSTS_PERSIST_LIMIT,
  persistPopularPosts,
} from '../../utils/homeCacheStorage';
import { sanitizeImageList, sanitizeRemoteImageUrl } from '../../utils/imageUrl';
import {
  invalidateAllPosts,
  invalidatePostComments,
  invalidateBlockedUsers,
  invalidatePostFeeds,
  patchLikedPostInCaches,
  patchPostStatusInCaches,
  patchUpdatedProfilePostInCaches,
} from '../../utils/queryInvalidation';
import { useApiQuery } from '../useApiQuery';
import type { QueryEnableOptions } from './types';
import { invalidateNotificationQueries } from './notifications';

export function usePopularPostsQuery(options?: QueryEnableOptions) {
  const tabEnabled = options?.enabled ?? true;
  const enabled = isApiEnabled() && tabEnabled;
  const userId = resolveRequestUserId();

  return useApiQuery({
    queryKey: ['posts', 'popular', userId],
    queryFn: async () => {
      const result = await fetchPopularPosts(HOME_POPULAR_POSTS_PERSIST_LIMIT);
      persistPopularPosts(result);
      return result;
    },
    enabled,
    staleTime: 30_000,
  });
}

export function usePopularPosts(options?: QueryEnableOptions) {
  const query = usePopularPostsQuery(options);

  const posts: HomeFeedPost[] = (query.data ?? []).map(mapHomeFeedPost);

  return {
    posts,
    isLoading: query.isLoading,
    isError: query.isError,
    refetch: query.refetch,
  };
}

function mapHomeFeedPost(item: HomeFeedPost): HomeFeedPost {
  const name = item.name?.trim() || '用户';
  const handle = item.handle?.trim() || `@${name}`;
  return {
    id: item.id,
    userId: item.userId,
    authorGender: item.authorGender,
    name,
    handle,
    event: item.event,
    location: item.location,
    body: item.body,
    time: item.time,
    likes: item.likes,
    liked: item.liked,
    comments: item.comments ?? 0,
    avatar: sanitizeRemoteImageUrl(item.avatar) ?? item.avatar,
    status: item.status ?? '招募中',
    activityLegacyId: item.activityLegacyId,
    contentTypes: item.contentTypes,
    images: sanitizeImageList(item.images),
  };
}

export function useEventPostsQuery(
  activityLegacyId?: number,
  options?: QueryEnableOptions,
) {
  const tabEnabled = options?.enabled ?? true;
  const enabled =
    isApiEnabled() &&
    activityLegacyId != null &&
    !Number.isNaN(activityLegacyId) &&
    tabEnabled;
  const userId = resolveRequestUserId();

  return useApiQuery({
    queryKey: ['posts', 'activity', activityLegacyId, userId],
    queryFn: () => fetchPostsByActivity(activityLegacyId as number),
    enabled,
    staleTime: 30_000,
  });
}

export function usePostCommentsQuery(postId: string, enabled: boolean) {
  const apiEnabled = isApiEnabled();

  return useApiQuery({
    queryKey: ['posts', postId, 'comments'],
    queryFn: () => fetchPostComments(postId),
    enabled: apiEnabled && enabled && Boolean(postId),
    staleTime: 10_000,
  });
}

export async function invalidatePostQueries() {
  await invalidateAllPosts();
}

export async function deletePostAndInvalidate(postId: string) {
  await deletePost(postId);
  await invalidatePostQueries();
}

export async function likePostAndInvalidate(postId: string) {
  const updated = await likePost(postId);
  patchLikedPostInCaches(updated);
  await invalidateNotificationQueries();
  return updated;
}

export async function commentPostAndInvalidate(
  postId: string,
  body: string,
  parentCommentId?: string,
) {
  const updated = await addPostComment(postId, body, parentCommentId);
  patchLikedPostInCaches(updated);
  await Promise.all([invalidateNotificationQueries(), invalidatePostComments(postId)]);
  return updated;
}

export async function applyToPostAndInvalidate(postId: string) {
  return applyToPost(postId);
}

export async function updatePostAndInvalidate(
  postId: string,
  payload: Parameters<typeof updatePost>[1],
) {
  const updated = await updatePost(postId, payload);
  if (payload.body !== undefined) {
    patchUpdatedProfilePostInCaches(updated);
  } else {
    patchPostStatusInCaches(postId, updated.status);
  }
  await invalidatePostQueries();
  return updated;
}

export async function blockUserAndInvalidate(blockedUserId: string) {
  const result = await blockUser(blockedUserId);
  invalidatePostFeeds();
  invalidateBlockedUsers();
  return result;
}

export { submitReport } from '../../api/sync/users';
