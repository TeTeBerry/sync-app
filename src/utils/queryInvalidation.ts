import { invalidateCache } from '../hooks/useApiQuery';

export { patchActivityRegistrationInCaches } from '../cache/activityCache';

export {
  popularPostsQueryKey,
  getPopularPostsFromCache,
  setPopularPostsCache,
} from '../cache/postCache';

export {
  markNotificationReadInCache,
  markAllNotificationsReadInCache,
  removeNotificationFromCache,
  clearNotificationsInCache,
} from '../cache/notificationCache';

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

/** 失效注册相关的个人资料查询（不刷新首页/活动列表，避免覆盖乐观更新） */
export function invalidateRegistrationProfile() {
  invalidateProfile();
  invalidateUser();
}

/** 失效注册/活动相关查询 */
export function invalidateRegistration() {
  invalidateRegistrationProfile();
  invalidateHome();
  invalidateCache(['activities']);
}
