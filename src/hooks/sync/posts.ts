import {
  acceptPostApplication,
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
import { isLiveApi } from '../../constants/api';
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
  invalidateProfilePosts,
  invalidateProfileSummary,
  patchLikedPostInCaches,
  patchPostStatusInCaches,
  patchProfilePostApplicationAccepted,
  patchUpdatedProfilePostInCaches,
} from '../../utils/queryInvalidation';
import { getCacheData } from '../useApiQuery';
import type { HomeSummary } from '../../types/backend';
import { isCurrentUserPostAuthor } from '../../utils/postOwnership';
import {
  STALE_POST_COMMENTS_MS,
  STALE_POSTS_FEED_MS,
} from '../../constants/queryCache';
import { useApiQuery } from '../useApiQuery';
import { useHomeSummary } from './activities';
import type { QueryEnableOptions } from './types';
import { invalidateNotificationQueries } from './notifications';
import { invalidateTeamChatQueries } from './teamChats';

export function usePopularPostsQuery(options?: QueryEnableOptions) {
  const tabEnabled = options?.enabled ?? true;
  const enabled = isLiveApi() && tabEnabled;
  const userId = resolveRequestUserId();

  return useApiQuery({
    queryKey: ['posts', 'popular', userId],
    queryFn: async () => {
      const result = await fetchPopularPosts(HOME_POPULAR_POSTS_PERSIST_LIMIT);
      persistPopularPosts(result);
      return result;
    },
    enabled,
    staleTime: STALE_POSTS_FEED_MS,
  });
}

export function usePopularPosts(options?: QueryEnableOptions) {
  const tabEnabled = options?.enabled ?? true;
  const { data: summary, isLoading: summaryLoading } = useHomeSummary();
  const embedded = summary?.popularPosts;
  const query = usePopularPostsQuery({
    enabled: tabEnabled && (embedded == null || embedded.length === 0),
  });

  const posts: HomeFeedPost[] = (embedded ?? query.data ?? []).map(mapHomeFeedPost);
  const usesEmbedded = embedded != null && embedded.length > 0;

  return {
    posts,
    isLoading: tabEnabled && !usesEmbedded && (query.isLoading || summaryLoading),
    isError: tabEnabled && !usesEmbedded && query.isError,
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
    isLiveApi() &&
    activityLegacyId != null &&
    !Number.isNaN(activityLegacyId) &&
    tabEnabled;
  const userId = resolveRequestUserId();

  return useApiQuery({
    queryKey: ['posts', 'activity', activityLegacyId, userId],
    queryFn: () => fetchPostsByActivity(activityLegacyId as number),
    enabled,
    staleTime: STALE_POSTS_FEED_MS,
  });
}

export function usePostCommentsQuery(postId: string, enabled: boolean) {
  const apiEnabled = isLiveApi();

  return useApiQuery({
    queryKey: ['posts', postId, 'comments'],
    queryFn: () => fetchPostComments(postId),
    enabled: apiEnabled && enabled && Boolean(postId),
    staleTime: STALE_POST_COMMENTS_MS,
  });
}

export async function invalidatePostQueries() {
  await invalidateAllPosts();
}

export async function deletePostAndInvalidate(postId: string) {
  await deletePost(postId);
  await invalidatePostQueries();
}

function readPostLikeStateFromCaches(
  postId: string,
  userId: string,
): Pick<HomeFeedPost, 'likes' | 'liked' | 'comments'> | null {
  const fromPopular = getCacheData<HomeFeedPost[]>(['posts', 'popular', userId])?.find(
    (post) => post.id === postId,
  );
  if (fromPopular) {
    return {
      likes: fromPopular.likes,
      liked: Boolean(fromPopular.liked),
      comments: fromPopular.comments ?? 0,
    };
  }

  const fromSummary = getCacheData<HomeSummary>([
    'home',
    'summary',
  ])?.popularPosts?.find((post) => post.id === postId);
  if (fromSummary) {
    return {
      likes: fromSummary.likes,
      liked: Boolean(fromSummary.liked),
      comments: fromSummary.comments ?? 0,
    };
  }

  return null;
}

export async function likePostAndInvalidate(postId: string) {
  const userId = resolveRequestUserId();
  const current = readPostLikeStateFromCaches(postId, userId);
  if (current) {
    patchLikedPostInCaches({
      id: postId,
      likes: current.liked ? Math.max(0, current.likes - 1) : current.likes + 1,
      liked: !current.liked,
      comments: current.comments,
    });
  }

  const updated = await likePost(postId);
  patchLikedPostInCaches(updated);
  if (isCurrentUserPostAuthor(undefined, updated.userId)) {
    invalidateProfileSummary();
  }
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

export async function applyToPostAndInvalidate(
  postId: string,
  payload?: Parameters<typeof applyToPost>[1],
) {
  const result = await applyToPost(postId, payload);
  invalidateTeamChatQueries();
  return result;
}

export async function acceptPostApplicationAndInvalidate(
  postId: string,
  applicantUserId: string,
) {
  const result = await acceptPostApplication(postId, applicantUserId);
  patchProfilePostApplicationAccepted(postId, applicantUserId);
  invalidateProfilePosts();
  invalidatePostFeeds();
  invalidateTeamChatQueries();
  return result;
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
