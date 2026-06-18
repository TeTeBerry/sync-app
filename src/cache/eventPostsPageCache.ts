import { fetchPostsByActivityPage } from '../api/syncApi';
import { isLiveApi } from '../constants/api';
import type { EventPostsPage } from '../types/backend';
import type { InfiniteQueryPage } from '../hooks/useApiInfiniteQuery';
import {
  broadcastCacheData,
  getCacheData,
  prefetchToCache,
  setCacheData,
} from '../hooks/useApiQuery';

export const EVENT_POSTS_PAGE_SIZE = 10;

export function eventPostsPageQueryKey(activityLegacyId: number) {
  return ['posts', 'activity', activityLegacyId, 'page'] as const;
}

export function getEventPostsPageCache(
  activityLegacyId: number,
): EventPostsPage | undefined {
  return getCacheData<InfiniteQueryPage<EventPostsPage['items'][number]>>([
    ...eventPostsPageQueryKey(activityLegacyId),
  ]);
}

export function setEventPostsPageCache(
  activityLegacyId: number,
  page: EventPostsPage,
): void {
  setCacheData<InfiniteQueryPage<EventPostsPage['items'][number]>>(
    [...eventPostsPageQueryKey(activityLegacyId)],
    () => page,
  );
  broadcastCacheData([...eventPostsPageQueryKey(activityLegacyId)]);
}

/** Warm first activity post page before event-detail mounts (tap / hover preload). */
export function prefetchEventPostsPage(
  activityLegacyId: number,
  options?: { anchorPostId?: string; pageSize?: number },
): void {
  if (!isLiveApi() || !Number.isFinite(activityLegacyId) || activityLegacyId <= 0) {
    return;
  }
  const key = eventPostsPageQueryKey(activityLegacyId);
  if (getCacheData<EventPostsPage>([...key])?.items?.length) {
    return;
  }
  void prefetchToCache([...key], () =>
    fetchPostsByActivityPage(activityLegacyId, {
      limit: options?.pageSize ?? EVENT_POSTS_PAGE_SIZE,
      anchorPostId: options?.anchorPostId,
    }),
  );
}
