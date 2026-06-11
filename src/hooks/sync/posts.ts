import { useCallback, useEffect, useState } from 'react';
import {
  addPostComment,
  deletePost,
  fetchPostComments,
  fetchPostsByActivity,
  fetchPopularPosts,
  likePost,
  updatePost,
} from '../../api/sync/posts';
import type { PostCommentItem } from '../../types/backend';
import { POST_COMMENTS_PAGE_SIZE } from '../../constants/listPerf';
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
  invalidateProfileSummary,
  patchPostEngagementInCaches,
  patchUpdatedProfilePostInCaches,
  popularPostsQueryKey,
  readPostEngagementFromCache,
  setPopularPostsCache,
} from '../../utils/queryInvalidation';
import { unwrapPostMutation } from '../../types/contracts/postMutation';
import { isCurrentUserPostAuthor } from '../../utils/postOwnership';
import {
  STALE_POST_COMMENTS_MS,
  STALE_POSTS_FEED_MS,
} from '../../constants/queryCache';
import { useApiQuery } from '../useApiQuery';
import type { QueryEnableOptions } from './types';
import { invalidateNotificationQueries } from './notifications';

export function usePopularPostsQuery(options?: QueryEnableOptions) {
  const tabEnabled = options?.enabled ?? true;
  const enabled = isLiveApi() && tabEnabled;
  const userId = resolveRequestUserId();

  return useApiQuery({
    queryKey: [...popularPostsQueryKey(userId)],
    queryFn: async () => {
      const result = await fetchPopularPosts(HOME_POPULAR_POSTS_PERSIST_LIMIT);
      const mapped = result.map(mapHomeFeedPost);
      persistPopularPosts(mapped);
      setPopularPostsCache(mapped, userId);
      return mapped;
    },
    enabled,
    staleTime: STALE_POSTS_FEED_MS,
  });
}

/** Home popular feed — canonical source is `posts/popular` cache (seeded from `/home`). */
export function usePopularPosts(options?: QueryEnableOptions) {
  const tabEnabled = options?.enabled ?? true;
  const query = usePopularPostsQuery({ enabled: tabEnabled });

  return {
    posts: (query.data ?? []).map(mapHomeFeedPost),
    isLoading: tabEnabled && query.isLoading && query.data === undefined,
    isError: tabEnabled && query.isError,
    refetch: query.refetch,
  };
}

export function mapHomeFeedPost(item: HomeFeedPost): HomeFeedPost {
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
    activityLegacyId: item.activityLegacyId,
    contentTypes: item.contentTypes,
    tags: item.tags,
    images: item.images?.length ? sanitizeImageList(item.images) : undefined,
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
  const queryEnabled = apiEnabled && enabled && Boolean(postId);
  const [extraItems, setExtraItems] = useState<PostCommentItem[]>([]);
  const [tailCursor, setTailCursor] = useState<string | undefined>();
  const [tailHasMore, setTailHasMore] = useState(false);
  const [loadingMore, setLoadingMore] = useState(false);

  const query = useApiQuery({
    queryKey: ['posts', postId, 'comments'],
    queryFn: () => fetchPostComments(postId, { limit: POST_COMMENTS_PAGE_SIZE }),
    enabled: queryEnabled,
    staleTime: STALE_POST_COMMENTS_MS,
  });

  useEffect(() => {
    setExtraItems([]);
    setTailCursor(undefined);
    setTailHasMore(false);
  }, [postId]);

  useEffect(() => {
    setExtraItems([]);
    setTailCursor(undefined);
    setTailHasMore(false);
  }, [query.data]);

  const hasMore = extraItems.length > 0 ? tailHasMore : (query.data?.hasMore ?? false);

  const loadMore = useCallback(async () => {
    if (!queryEnabled || loadingMore || !hasMore) return;
    const cursor = extraItems.length > 0 ? tailCursor : query.data?.nextCursor;
    if (!cursor) return;

    setLoadingMore(true);
    try {
      const page = await fetchPostComments(postId, {
        limit: POST_COMMENTS_PAGE_SIZE,
        cursor,
      });
      setExtraItems((prev) => [...prev, ...page.items]);
      setTailCursor(page.nextCursor);
      setTailHasMore(page.hasMore);
    } finally {
      setLoadingMore(false);
    }
  }, [
    extraItems.length,
    hasMore,
    loadingMore,
    postId,
    query.data?.nextCursor,
    queryEnabled,
    tailCursor,
  ]);

  const items = [...(query.data?.items ?? []), ...extraItems];

  return {
    ...query,
    data: items,
    hasMore,
    loadingMore,
    loadMore,
  };
}

export async function invalidatePostQueries() {
  await invalidateAllPosts();
}

export async function deletePostAndInvalidate(postId: string) {
  await deletePost(postId);
  await invalidatePostQueries();
}

export async function likePostAndInvalidate(postId: string) {
  const userId = resolveRequestUserId();
  const current = readPostEngagementFromCache(postId, userId);
  if (current) {
    patchPostEngagementInCaches({
      id: postId,
      likes: current.liked ? Math.max(0, current.likes - 1) : current.likes + 1,
      liked: !current.liked,
      comments: current.comments,
    });
  }

  const updated = unwrapPostMutation(await likePost(postId));
  patchPostEngagementInCaches(updated);
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
  const updated = unwrapPostMutation(
    await addPostComment(postId, body, parentCommentId),
  );
  patchPostEngagementInCaches(updated);
  await Promise.all([invalidateNotificationQueries(), invalidatePostComments(postId)]);
  return updated;
}

export async function updatePostAndInvalidate(
  postId: string,
  payload: Parameters<typeof updatePost>[1],
) {
  const updated = await updatePost(postId, payload);
  if (payload.body !== undefined) {
    patchUpdatedProfilePostInCaches(updated);
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

export { fetchReportStatus, submitReport } from '../../api/sync/users';
