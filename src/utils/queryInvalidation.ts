import type { QueryClient } from "@tanstack/react-query";

/** 失效通知相关查询 */
export function invalidateNotifications(queryClient: QueryClient) {
  return queryClient.invalidateQueries({ queryKey: ["notifications"] });
}

/** 失效用户个人资料查询 */
export function invalidateProfile(queryClient: QueryClient) {
  return Promise.all([
    queryClient.invalidateQueries({ queryKey: ["profile", "activities"] }),
    queryClient.invalidateQueries({ queryKey: ["profile", "summary"] }),
  ]);
}

/** 失效当前用户查询 */
export function invalidateUser(queryClient: QueryClient) {
  return queryClient.invalidateQueries({ queryKey: ["users", "me"] });
}

/** 失效首页查询 */
export function invalidateHome(queryClient: QueryClient) {
  return queryClient.invalidateQueries({ queryKey: ["home"] });
}

/** 失效帖子 Feed 查询 */
export function invalidatePostFeeds(queryClient: QueryClient, exact = false) {
  return Promise.all([
    queryClient.invalidateQueries({ queryKey: ["posts", "popular"], exact }),
    queryClient.invalidateQueries({ queryKey: ["posts", "all"], exact }),
    queryClient.invalidateQueries({ queryKey: ["posts", "activity"], exact }),
  ]);
}

/** 失效所有帖子及关联查询 */
export function invalidateAllPosts(queryClient: QueryClient) {
  return Promise.all([
    queryClient.invalidateQueries({ queryKey: ["posts"] }),
    queryClient.invalidateQueries({ queryKey: ["profile", "posts"] }),
    queryClient.invalidateQueries({ queryKey: ["profile", "summary"] }),
  ]);
}

/** 失效注册/活动相关查询 */
export function invalidateRegistration(queryClient: QueryClient) {
  return Promise.all([
    invalidateProfile(queryClient),
    invalidateUser(queryClient),
    invalidateHome(queryClient),
  ]);
}

/** 失效指定帖子的评论查询 */
export function invalidatePostComments(queryClient: QueryClient, postId: string) {
  return queryClient.invalidateQueries({ queryKey: ["posts", postId, "comments"] });
}
