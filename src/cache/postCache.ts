import {
  broadcastCacheData,
  forEachCacheEntry,
  getCacheData,
  setCacheData,
  setCacheDataByKey,
} from '../hooks/useApiQuery';
import type { InfiniteQueryPage } from '../hooks/useApiInfiniteQuery';
import type { EventDetailPost, ProfilePostItem } from '../types/backend';

/** Drop a deleted post from profile + activity feed caches. */
export function removePostFromCaches(postId: string): void {
  const trimmedId = postId.trim();
  if (!trimmedId) return;

  setCacheData<ProfilePostItem[]>(['profile', 'posts'], (prev) => {
    if (!prev?.length) return prev;
    const next = prev.filter((post) => post.id !== trimmedId);
    return next.length === prev.length ? prev : next;
  });

  forEachCacheEntry((cacheKey, data) => {
    if (!cacheKey.startsWith('posts|activity|') || !cacheKey.includes('|page')) {
      return;
    }
    const page = data as InfiniteQueryPage<EventDetailPost> | undefined;
    if (!page?.items?.length) return;
    const nextItems = page.items.filter((post) => post.id !== trimmedId);
    if (nextItems.length === page.items.length) return;
    setCacheDataByKey(cacheKey, {
      ...page,
      items: nextItems,
    });
  });

  broadcastCacheData(['profile', 'posts']);
  broadcastCacheData(['posts']);
}

/** Read-through helper for tests and route prefetch guards. */
export function getActivityPostsCacheItemCount(activityLegacyId: number): number {
  return (
    getCacheData<InfiniteQueryPage<EventDetailPost>>([
      'posts',
      'activity',
      activityLegacyId,
      'page',
    ])?.items.length ?? 0
  );
}
