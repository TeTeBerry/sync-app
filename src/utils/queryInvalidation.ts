import {
  broadcastCacheData,
  forEachCacheEntry,
  getCacheData,
  invalidateCache,
  setCacheDataByKey,
} from '../hooks/useApiQuery';
import type {
  HomeFeedPost,
  EventDetailPost,
  EventPostsPage,
  ProfilePostItem,
  ProfileSummary,
} from '../types/backend';
import { sumProfilePostLikes } from './profileLikes';
import type { BackendPostStatusLabel } from './postStatus';

/** 失效通知相关查询 */
export function invalidateNotifications() {
  invalidateCache(['notifications']);
}

/** 失效用户个人资料查询 */
export function invalidateProfile() {
  invalidateProfileActivities();
  invalidateProfileSummary();
}

/** 失效个人资料摘要（个人 tab 展示） */
export function invalidateProfileSummary() {
  invalidateCache(['profile', 'summary']);
}

/** 失效单场套餐权益查询 */
export function invalidateProfileEntitlements() {
  invalidateCache(['profile', 'entitlements']);
}

/** 失效套餐权益与个人摘要（购买后刷新） */
export function invalidateProfilePackageState() {
  invalidateProfileEntitlements();
  invalidateProfileSummary();
}

/** 失效个人活动列表 */
export function invalidateProfileActivities() {
  invalidateCache(['profile', 'activities']);
}

/** 失效个人帖子列表 */
export function invalidateProfilePosts() {
  invalidateCache(['profile', 'posts']);
}

/** 失效当前用户查询 */
export function invalidateUser() {
  invalidateCache(['users', 'me']);
}

/** 失效首页查询 */
export function invalidateHome() {
  invalidateCache(['home']);
}

/** 失效帖子 Feed 查询 */
export function invalidatePostFeeds() {
  invalidateCache(['posts', 'popular']);
  invalidateCache(['posts', 'activity']);
}

/** 失效已屏蔽用户列表 */
export function invalidateBlockedUsers() {
  invalidateCache(['users', 'blocks']);
}

/** 失效所有帖子及关联查询 */
export function invalidateAllPosts() {
  invalidateCache(['posts']);
  invalidateCache(['profile', 'posts']);
  invalidateCache(['profile', 'summary']);
}

/** 失效注册/活动相关查询 */
export function invalidateRegistration() {
  invalidateProfile();
  invalidateUser();
  invalidateHome();
}

/** 失效指定帖子的评论查询 */
export function invalidatePostComments(postId: string) {
  invalidateCache(['posts', postId, 'comments']);
}

export function patchPostStatusInCaches(
  postId: string,
  status: BackendPostStatusLabel,
) {
  const patchList = <T extends { id: string; status?: BackendPostStatusLabel }>(
    posts: T[] | undefined,
  ) => posts?.map((post) => (post.id === postId ? { ...post, status } : post));

  forEachCacheEntry((key, data) => {
    if (!key.startsWith('posts|') && key !== 'profile|posts') return;
    if (!Array.isArray(data)) return;
    const patched = patchList(
      data as { id: string; status?: BackendPostStatusLabel }[],
    );
    if (patched) {
      setCacheDataByKey(key, patched);
    }
  });

  broadcastCacheData(['posts']);
  broadcastCacheData(['profile', 'posts']);
}

export function patchUpdatedProfilePostInCaches(updated: ProfilePostItem) {
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

  forEachCacheEntry((key, data) => {
    if (key !== 'profile|posts') return;
    const patched = patchList(data as ProfilePostItem[] | undefined);
    if (patched) {
      setCacheDataByKey(key, patched);
    }
  });

  patchPostStatusInCaches(updated.id, updated.status);
  broadcastCacheData(['profile', 'posts']);
}

export function patchLikedPostInCaches(
  updated: Pick<EventDetailPost, 'id' | 'likes' | 'liked' | 'comments'>,
) {
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

  forEachCacheEntry((key, entryData) => {
    if (!key.startsWith('posts|')) return;
    if (!Array.isArray(entryData)) return;

    if (key.startsWith('posts|popular|')) {
      const patched = patchFeedPosts(entryData as HomeFeedPost[]);
      if (patched) {
        setCacheDataByKey(key, patched);
      }
      return;
    }

    if (key.startsWith('posts|activity|')) {
      if (Array.isArray(entryData)) {
        const patched = patchEventPosts(entryData as EventDetailPost[]);
        if (patched) {
          setCacheDataByKey(key, patched);
        }
        return;
      }
      const page = entryData as EventPostsPage;
      if (page?.items && Array.isArray(page.items)) {
        const patchedItems = patchEventPosts(page.items);
        if (patchedItems) {
          setCacheDataByKey(key, { ...page, items: patchedItems });
        }
      }
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

/** Recompute profile summary 获赞数 from cached /profile/posts (same rule as backend). */
export function syncProfileSummaryLikesFromPostsCache(): void {
  const posts = getCacheData<ProfilePostItem[]>(['profile', 'posts']);
  if (!posts) {
    return;
  }
  const likes = sumProfilePostLikes(posts);
  forEachCacheEntry((key, data) => {
    if (!key.startsWith('profile|summary|')) return;
    const summary = data as ProfileSummary | undefined;
    if (!summary?.stats) return;
    setCacheDataByKey(key, {
      ...summary,
      stats: { ...summary.stats, likes },
    });
  });
  broadcastCacheData(['profile', 'summary']);
}
