import { fetchPostNavigationTarget } from '../api/sync/posts';
import { getPopularPostsFromCache } from '../cache/postCache';
import { forEachCacheEntry, getCacheData } from '../hooks/useApiQuery';
import type {
  EventPostsPage,
  HomeFeedPost,
  NotificationMeta,
  ProfilePostItem,
} from '../types/backend';
import { parseActivityLegacyId } from './activityLegacyId';

export function isPostInteractionNotification(meta?: NotificationMeta): boolean {
  if (!meta) return false;
  if (
    meta.type === 'like' ||
    meta.type === 'comment' ||
    meta.type === 'comment_reply'
  ) {
    return true;
  }
  if (meta.category === 'like' || meta.category === 'comment') {
    return true;
  }
  const templateKey = meta.templateKey ?? '';
  return /notifications\.types\.(like|comment)/.test(templateKey);
}

function findActivityLegacyIdInCaches(postId: string): number | null {
  const fromPopular = getPopularPostsFromCache()?.find((post) => post.id === postId);
  const popularLegacyId = parseActivityLegacyId(fromPopular?.activityLegacyId);
  if (popularLegacyId != null) return popularLegacyId;

  const profilePosts = getCacheData<ProfilePostItem[]>(['profile', 'posts']);
  const profileLegacyId = parseActivityLegacyId(
    profilePosts?.find((post) => post.id === postId)?.activityLegacyId,
  );
  if (profileLegacyId != null) return profileLegacyId;

  let legacyId: number | null = null;
  forEachCacheEntry((key, data) => {
    if (legacyId != null) return;
    const match = key.match(/^posts\|activity(?:\|page)?\|(\d+)/);
    if (!match) return;

    const activityLegacyId = parseActivityLegacyId(match[1]);
    if (activityLegacyId == null) return;

    if (Array.isArray(data)) {
      if ((data as HomeFeedPost[]).some((post) => post.id === postId)) {
        legacyId = activityLegacyId;
      }
      return;
    }

    const page = data as EventPostsPage;
    if (page?.items?.some((post) => post.id === postId)) {
      legacyId = activityLegacyId;
    }
  });

  return legacyId;
}

export async function resolveNotificationPostTarget(
  meta: NotificationMeta,
): Promise<{ postId: string; activityLegacyId: number } | null> {
  const postId = meta.postId?.trim();
  if (!postId) return null;

  const fromMeta = parseActivityLegacyId(meta.activityLegacyId);
  if (fromMeta != null) {
    return { postId, activityLegacyId: fromMeta };
  }

  const fromCache = findActivityLegacyIdInCaches(postId);
  if (fromCache != null) {
    return { postId, activityLegacyId: fromCache };
  }

  try {
    return await fetchPostNavigationTarget(postId);
  } catch {
    return null;
  }
}
