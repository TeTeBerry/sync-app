import { invalidateCache } from '../hooks/useApiQuery';

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

/** 失效当前用户查询 */
export function invalidateUser() {
  invalidateCache(['users', 'me']);
}

/** 失效首页查询 */
export function invalidateHome() {
  invalidateCache(['home']);
}

/** 失效注册相关的个人资料查询（不刷新首页/活动列表，避免覆盖乐观更新） */
export function invalidateRegistrationProfile() {
  invalidateProfile();
  invalidateUser();
}
