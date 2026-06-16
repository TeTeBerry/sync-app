import { broadcastCacheData, getCacheData, setCacheData } from '../hooks/useApiQuery';
import type { HomeFeedPost, HomeSummary, ProfilePostItem } from '../types/backend';
import { persistHomeSummary, persistPopularPosts } from '../utils/homeCacheStorage';

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

/** Drop a deleted post from home summary + popular feed caches (and persisted storage). */
export function removePostFromCaches(postId: string): void {
  const trimmedId = postId.trim();
  if (!trimmedId) return;

  const withoutPost = <T extends { id: string }>(posts: T[] | undefined) =>
    posts?.filter((post) => post.id !== trimmedId);

  setCacheData<HomeFeedPost[]>([...popularPostsQueryKey()], (prev) => {
    if (!prev?.length) return prev;
    const next = withoutPost(prev);
    if (!next || next.length === prev.length) return prev;
    persistPopularPosts(next);
    return next;
  });

  setCacheData<HomeSummary>(['home', 'summary'], (prev) => {
    if (!prev?.popularPosts?.length) return prev;
    const nextPopular = withoutPost(prev.popularPosts);
    if (!nextPopular || nextPopular.length === prev.popularPosts.length) return prev;
    const next = { ...prev, popularPosts: nextPopular };
    persistHomeSummary(next);
    return next;
  });

  setCacheData<ProfilePostItem[]>(['profile', 'posts'], (prev) => {
    if (!prev?.length) return prev;
    const next = withoutPost(prev);
    return next?.length === prev.length ? prev : next;
  });

  broadcastCacheData(['posts', 'popular']);
  broadcastCacheData(['home', 'summary']);
  broadcastCacheData(['profile', 'posts']);
}
