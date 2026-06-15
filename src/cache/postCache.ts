import {
  broadcastCacheData,
  forEachCacheEntry,
  getCacheData,
  setCacheData,
  setCacheDataByKey,
} from '../hooks/useApiQuery';
import { resolveRequestUserId } from '../api/requestContext';
import type { HomeFeedPost } from '../types/backend';

/** Canonical cache key for home popular feed (single source of truth). */
export function popularPostsQueryKey(userId?: string) {
  return ['posts', 'popular', userId ?? resolveRequestUserId()] as const;
}

export function getPopularPostsFromCache(userId?: string): HomeFeedPost[] | undefined {
  return getCacheData<HomeFeedPost[]>([...popularPostsQueryKey(userId)]);
}

export function setPopularPostsCache(posts: HomeFeedPost[], userId?: string): void {
  const key = popularPostsQueryKey(userId);
  setCacheData<HomeFeedPost[]>([...key], () => posts);
  broadcastCacheData(['posts', 'popular']);
}
