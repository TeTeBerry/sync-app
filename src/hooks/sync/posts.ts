import { useCallback, useEffect, useState } from 'react';
import {
  addPostComment,
  deletePost,
  fetchPostComments,
  fetchPostsByActivity,
  fetchPopularPosts,
} from '../../api/sync/posts';
import type { PostCommentItem } from '../../types/backend';
import { POST_COMMENTS_PAGE_SIZE } from '../../constants/listPerf';
import { resolveRequestUserId } from '../../api/requestContext';
import type { HomeFeedPost, HomeSummary } from '../../types/backend';
import { isLiveApi } from '../../constants/api';
import {
  getPopularPostsFromCache,
  popularPostsQueryKey,
  removePostFromCaches,
  setPopularPostsCache,
} from '../../cache/postCache';
import {
  HOME_POPULAR_POSTS_PERSIST_LIMIT,
  persistPopularPosts,
} from '../../utils/homeCacheStorage';
import { sanitizeRemoteImageUrl } from '../../utils/imageUrl';
import { invalidateAllPosts } from '../../utils/queryInvalidation';
import {
  STALE_POST_COMMENTS_MS,
  STALE_POSTS_FEED_MS,
} from '../../constants/queryCache';
import { getCacheData, invalidateCache, useApiQuery } from '../useApiQuery';
import type { QueryEnableOptions } from './types';

/** Home popular feed — canonical source is `posts/popular` cache (seeded from `/home`). */
export function usePopularPosts(options?: QueryEnableOptions) {
  const tabEnabled = options?.enabled ?? true;
  const enabled = isLiveApi() && tabEnabled;

  const query = useApiQuery({
    queryKey: [...popularPostsQueryKey()],
    queryFn: async () => {
      const cached = getPopularPostsFromCache();
      if (cached?.length) {
        return cached.map(mapHomeFeedPost);
      }
      const fromHome = getCacheData<HomeSummary>(['home', 'summary'])?.popularPosts;
      if (fromHome?.length) {
        const mapped = fromHome.map(mapHomeFeedPost);
        persistPopularPosts(mapped);
        setPopularPostsCache(mapped);
        return mapped;
      }
      const result = await fetchPopularPosts(HOME_POPULAR_POSTS_PERSIST_LIMIT);
      const mapped = result.map(mapHomeFeedPost);
      persistPopularPosts(mapped);
      setPopularPostsCache(mapped);
      return mapped;
    },
    enabled,
    staleTime: STALE_POSTS_FEED_MS,
  });

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
    avatar: sanitizeRemoteImageUrl(item.avatar) ?? item.avatar,
    activityLegacyId: item.activityLegacyId,
    tags: item.tags,
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

export async function invalidatePostQueries() {
  await invalidateAllPosts();
}

export async function deletePostAndInvalidate(postId: string) {
  await deletePost(postId);
  removePostFromCaches(postId);
  await invalidatePostQueries();
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

export function invalidatePostComments(postId: string) {
  invalidateCache(['posts', postId, 'comments']);
}

export async function commentPostAndInvalidate(
  postId: string,
  body: string,
  parentCommentId?: string,
) {
  const updated = await addPostComment(postId, body, parentCommentId);
  invalidatePostComments(postId);
  return updated;
}
