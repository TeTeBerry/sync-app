import { describe, expect, it } from 'vitest';
import { MAX_BUDDY_POSTS_PER_ACTIVITY } from '@/constants/buddyPostLimits';
import type { ProfilePostItem } from '@/types/backend';
import {
  buildBuddyPostLimitToast,
  buildBuddyPostQuotaHint,
  countOwnerPostsForActivity,
  resolveBuddyPostQuota,
} from '@/utils/buddyPostQuota';

function post(activityLegacyId: number, id = 'p1'): ProfilePostItem {
  return {
    id,
    title: 't',
    content: 'c',
    date: '2026-01-01',
    activityLegacyId,
  };
}

describe('buddyPostQuota', () => {
  it('counts posts for the given activity only', () => {
    const posts = [post(1, 'a'), post(2, 'b'), post(1, 'c')];
    expect(countOwnerPostsForActivity(posts, 1)).toBe(2);
    expect(countOwnerPostsForActivity(posts, 3)).toBe(0);
  });

  it('returns zero for invalid activity ids', () => {
    const posts = [post(1)];
    expect(countOwnerPostsForActivity(posts, 0)).toBe(0);
    expect(countOwnerPostsForActivity(posts, Number.NaN)).toBe(0);
  });

  it('resolves quota with remaining and atLimit', () => {
    const posts = Array.from({ length: 7 }, (_, i) => post(42, `p${i}`));
    const under = resolveBuddyPostQuota(posts, 42);
    expect(under).toEqual({
      used: 7,
      max: MAX_BUDDY_POSTS_PER_ACTIVITY,
      remaining: 1,
      atLimit: false,
    });

    const atLimitPosts = [...posts, post(42, 'p7')];
    const atLimit = resolveBuddyPostQuota(atLimitPosts, 42);
    expect(atLimit.remaining).toBe(0);
    expect(atLimit.atLimit).toBe(true);
  });

  it('builds limit toast and sheet hint copy', () => {
    expect(buildBuddyPostLimitToast('草莓音乐节')).toContain('草莓音乐节');
    expect(buildBuddyPostLimitToast('草莓音乐节')).toContain('8 篇帖子');

    const hint = buildBuddyPostQuotaHint({
      used: 3,
      max: 8,
      remaining: 5,
      atLimit: false,
    });
    expect(hint).toBe('本场活动最多 8 篇组队帖，你已发布 3 篇');
  });
});
