import { invalidateCache, setCacheData } from "../hooks/useApiQuery";
import type { HomeSummary, HomeFeedPost, EventDetailPost } from "../types/backend";

/** 失效通知相关查询 */
export function invalidateNotifications() {
  invalidateCache(["notifications"]);
}

/** 失效用户个人资料查询 */
export function invalidateProfile() {
  invalidateCache(["profile", "activities"]);
  invalidateCache(["profile", "summary"]);
}

/** 失效当前用户查询 */
export function invalidateUser() {
  invalidateCache(["users", "me"]);
}

/** 失效首页查询 */
export function invalidateHome() {
  invalidateCache(["home"]);
}

/** 失效帖子 Feed 查询 */
export function invalidatePostFeeds() {
  invalidateCache(["posts", "popular"]);
  invalidateCache(["posts", "all"]);
  invalidateCache(["posts", "activity"]);
}

/** 失效所有帖子及关联查询 */
export function invalidateAllPosts() {
  invalidateCache(["posts"]);
  invalidateCache(["profile", "posts"]);
  invalidateCache(["profile", "summary"]);
}

/** 失效注册/活动相关查询 */
export function invalidateRegistration() {
  invalidateProfile();
  invalidateUser();
  invalidateHome();
}

/** 失效指定帖子的评论查询 */
export function invalidatePostComments(postId: string) {
  invalidateCache(["posts", postId, "comments"]);
}

export function patchLikedPostInCaches(
  updated: Pick<EventDetailPost, "id" | "likes" | "liked" | "comments">,
) {
  const patchFeedPosts = (posts: HomeFeedPost[] | undefined) =>
    posts?.map((post) =>
      post.id === updated.id
        ? {
            ...post,
            likes: updated.likes,
            liked: updated.liked ?? false,
            comments: updated.comments ?? post.comments,
          }
        : post,
    );

  const patchEventPosts = (posts: EventDetailPost[] | undefined) =>
    posts?.map((post) =>
      post.id === updated.id
        ? {
            ...post,
            likes: updated.likes,
            liked: updated.liked ?? false,
            comments: updated.comments ?? post.comments,
          }
        : post,
    );

  setCacheData<HomeFeedPost[]>(["posts", "popular"], patchFeedPosts);
  setCacheData<HomeFeedPost[]>(["posts", "all"], patchFeedPosts);
  setCacheData<EventDetailPost[]>(["posts", "activity"], patchEventPosts);
}
