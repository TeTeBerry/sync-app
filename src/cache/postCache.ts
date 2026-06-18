import { broadcastCacheData, getCacheData, setCacheData } from '../hooks/useApiQuery';
import type { ProfilePostItem } from '../types/backend';

/** Drop a deleted post from profile posts cache. */
export function removePostFromCaches(postId: string): void {
  const trimmedId = postId.trim();
  if (!trimmedId) return;

  setCacheData<ProfilePostItem[]>(['profile', 'posts'], (prev) => {
    if (!prev?.length) return prev;
    const next = prev.filter((post) => post.id !== trimmedId);
    return next.length === prev.length ? prev : next;
  });

  broadcastCacheData(['profile', 'posts']);
}
