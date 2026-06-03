import {
  broadcastCacheData,
  forEachCacheEntry,
  getCacheData,
  setCacheData,
  setCacheDataByKey,
} from '../hooks/useApiQuery';
import { resolveRequestUserId } from '../api/requestContext';
import type {
  EventDetailPost,
  EventPostsPage,
  HomeFeedPost,
  HomeSummary,
  ProfilePostItem,
  ProfileSummary,
} from '../types/backend';
import { sumProfilePostLikes } from '../utils/profileLikes';
import { patchProfilePostAfterAcceptApplication } from '../utils/profilePostApplications';
import type { BackendPostStatusLabel } from '../utils/postStatus';

export type PostEngagementPatch = Pick<
  EventDetailPost,
  'id' | 'likes' | 'liked' | 'comments'
>;

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

export function readPostEngagementFromCache(
  postId: string,
  userId?: string,
): Pick<HomeFeedPost, 'likes' | 'liked' | 'comments'> | null {
  const fromPopular = getPopularPostsFromCache(userId)?.find(
    (post) => post.id === postId,
  );
  if (fromPopular) {
    return {
      likes: fromPopular.likes,
      liked: Boolean(fromPopular.liked),
      comments: fromPopular.comments ?? 0,
    };
  }
  return null;
}

export function patchPostEngagementInCaches(updated: PostEngagementPatch): void {
  const patchPost = <
    T extends { id: string; likes: number; liked?: boolean; comments: number },
  >(
    post: T,
  ): T => {
    if (post.id !== updated.id) return post;
    return {
      ...post,
      ...(updated.likes !== undefined ? { likes: updated.likes } : {}),
      ...(updated.liked !== undefined ? { liked: updated.liked } : {}),
      ...(updated.comments !== undefined ? { comments: updated.comments } : {}),
    };
  };

  const patchFeedPosts = (posts: HomeFeedPost[] | undefined) => posts?.map(patchPost);
  const patchEventPosts = (posts: EventDetailPost[] | undefined) =>
    posts?.map(patchPost);

  const popularKey = getCacheKeyString(popularPostsQueryKey());
  forEachCacheEntry((key, entryData) => {
    if (key === popularKey && Array.isArray(entryData)) {
      const patched = patchFeedPosts(entryData as HomeFeedPost[]);
      if (patched) setCacheDataByKey(key, patched);
      return;
    }

    if (!key.startsWith('posts|')) return;
    if (!Array.isArray(entryData)) return;

    if (key.startsWith('posts|activity|')) {
      const patched = patchEventPosts(entryData as EventDetailPost[]);
      if (patched) setCacheDataByKey(key, patched);
      return;
    }
  });

  forEachCacheEntry((key, entryData) => {
    if (!key.startsWith('posts|activity|')) return;
    const page = entryData as EventPostsPage;
    if (!page?.items?.length) return;
    const patchedItems = patchEventPosts(page.items);
    if (patchedItems) {
      setCacheDataByKey(key, { ...page, items: patchedItems });
    }
  });

  let profilePostsPatched = false;
  forEachCacheEntry((key, entryData) => {
    if (key !== 'profile|posts' || !Array.isArray(entryData)) return;
    const patched = (entryData as ProfilePostItem[]).map((post) =>
      post.id === updated.id && updated.likes !== undefined
        ? { ...post, likes: updated.likes }
        : post,
    );
    setCacheDataByKey(key, patched);
    profilePostsPatched = true;
  });

  if (profilePostsPatched) {
    syncProfileSummaryLikesFromPostsCache();
    broadcastCacheData(['profile', 'posts']);
  }

  broadcastCacheData(['posts']);
}

export function patchPostStatusInCaches(
  postId: string,
  status: BackendPostStatusLabel,
): void {
  const patchList = <T extends { id: string; status?: BackendPostStatusLabel }>(
    posts: T[] | undefined,
  ) => posts?.map((post) => (post.id === postId ? { ...post, status } : post));

  forEachCacheEntry((key, entryData) => {
    if (!key.startsWith('posts|') && key !== 'profile|posts') return;
    if (!Array.isArray(entryData)) return;
    const patched = patchList(
      entryData as { id: string; status?: BackendPostStatusLabel }[],
    );
    if (patched) setCacheDataByKey(key, patched);
  });

  broadcastCacheData(['posts']);
  broadcastCacheData(['profile', 'posts']);
}

export function patchProfilePostApplicationAccepted(
  postId: string,
  applicantUserId: string,
): void {
  forEachCacheEntry((key, entryData) => {
    if (key !== 'profile|posts' || !Array.isArray(entryData)) return;
    const patched = patchProfilePostAfterAcceptApplication(
      entryData as ProfilePostItem[],
      postId,
      applicantUserId,
    );
    setCacheDataByKey(key, patched);
  });

  patchPostStatusInCaches(postId, '已组队');
  broadcastCacheData(['profile', 'posts']);
}

export function patchUpdatedProfilePostInCaches(updated: ProfilePostItem): void {
  const patchList = (posts: ProfilePostItem[] | undefined) =>
    posts?.map((post) =>
      post.id === updated.id
        ? {
            ...post,
            content: updated.content,
            status: updated.status,
            title: updated.title,
          }
        : post,
    );

  forEachCacheEntry((key, entryData) => {
    if (key !== 'profile|posts') return;
    const patched = patchList(entryData as ProfilePostItem[] | undefined);
    if (patched) setCacheDataByKey(key, patched);
  });

  patchPostStatusInCaches(updated.id, updated.status);
  broadcastCacheData(['profile', 'posts']);
}

export function syncProfileSummaryLikesFromPostsCache(): void {
  const posts = getCacheData<ProfilePostItem[]>(['profile', 'posts']);
  if (!posts) return;

  const likes = sumProfilePostLikes(posts);
  forEachCacheEntry((key, entryData) => {
    if (!key.startsWith('profile|summary|')) return;
    const summary = entryData as ProfileSummary | undefined;
    if (!summary?.stats) return;
    setCacheDataByKey(key, {
      ...summary,
      stats: { ...summary.stats, likes },
    });
  });
  broadcastCacheData(['profile', 'summary']);
}

/** @deprecated Home summary no longer mirrors popular posts; kept for legacy cache cleanup. */
export function stripPopularPostsFromHomeSummaryCache(): void {
  setCacheData<HomeSummary>(['home', 'summary'], (prev) => {
    if (!prev?.popularPosts?.length) return prev;
    const { popularPosts: _removed, ...rest } = prev;
    return rest as HomeSummary;
  });
  broadcastCacheData(['home', 'summary']);
}

function getCacheKeyString(queryKey: readonly (string | number | undefined)[]): string {
  return queryKey.map(String).join('|');
}
