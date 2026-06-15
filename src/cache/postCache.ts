import { broadcastCacheData, getCacheData, setCacheData } from '../hooks/useApiQuery';
import type { HomeFeedPost } from '../types/backend';

/** Canonical cache key for home popular feed (single source of truth). */
export function popularPostsQueryKey() {
  return ['posts', 'popular'] as const;
}

export function getPopularPostsFromCache(): HomeFeedPost[] | undefined {
  return getCacheData<HomeFeedPost[]>([...popularPostsQueryKey()]);
}

export function setPopularPostsCache(posts: HomeFeedPost[]): void {
  const key = popularPostsQueryKey();
  setCacheData<HomeFeedPost[]>([...key], () => posts);
  broadcastCacheData(['posts', 'popular']);
}
