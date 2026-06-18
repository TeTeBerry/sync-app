import { MAX_BUDDY_POSTS_PER_ACTIVITY } from '../constants/buddyPostLimits';
import type { ProfilePostItem } from '../types/backend';

export type BuddyPostQuota = {
  used: number;
  max: number;
  remaining: number;
  atLimit: boolean;
};

export function countOwnerPostsForActivity(
  posts: ProfilePostItem[],
  activityLegacyId: number,
): number {
  if (!Number.isFinite(activityLegacyId) || activityLegacyId <= 0) {
    return 0;
  }
  return posts.filter((post) => post.activityLegacyId === activityLegacyId).length;
}

export function resolveBuddyPostQuota(
  posts: ProfilePostItem[],
  activityLegacyId: number,
  max: number = MAX_BUDDY_POSTS_PER_ACTIVITY,
): BuddyPostQuota {
  const used = countOwnerPostsForActivity(posts, activityLegacyId);
  const safeMax = Math.max(1, max);
  const remaining = Math.max(0, safeMax - used);
  return {
    used,
    max: safeMax,
    remaining,
    atLimit: used >= safeMax,
  };
}

export function buildBuddyPostLimitToast(
  activityTitle: string,
  max: number = MAX_BUDDY_POSTS_PER_ACTIVITY,
): string {
  const title = activityTitle.trim() || '本场活动';
  return `您在「${title}」已发布 ${max} 篇帖子，达到上限。请先删除或修改之前的帖子后再发布。`;
}

export function buildBuddyPostQuotaHint(quota: BuddyPostQuota): string {
  return `本场活动最多 ${quota.max} 篇组队帖，你已发布 ${quota.used} 篇`;
}
