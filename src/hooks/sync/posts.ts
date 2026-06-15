import {
  fetchPostsByActivity,
  fetchPopularPosts,
  deletePost,
} from '../../api/sync/posts';
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
  invalidateBlockedUsers,
  invalidatePostFeeds,
  popularPostsQueryKey,
  setPopularPostsCache,
} from '../../utils/queryInvalidation';
import { STALE_POSTS_FEED_MS } from '../../constants/queryCache';
import { useApiQuery } from '../useApiQuery';
import type { QueryEnableOptions } from './types';
import { blockUser } from '../../api/sync/users';

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

export async function invalidatePostQueries() {
  await invalidateAllPosts();
}

export async function deletePostAndInvalidate(postId: string) {
  await deletePost(postId);
  await invalidatePostQueries();
}

export async function blockUserAndInvalidate(blockedUserId: string) {
  const result = await blockUser(blockedUserId);
  invalidatePostFeeds();
  invalidateBlockedUsers();
  return result;
}

export { fetchReportStatus, submitReport } from '../../api/sync/users';
