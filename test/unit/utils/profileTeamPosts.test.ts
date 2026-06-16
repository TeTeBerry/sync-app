import { describe, expect, it } from 'vitest';
import { filterProfileTeamPosts, isProfileSharePost } from '@/utils/profileTeamPosts';
import type { ProfilePostItem } from '@/types/backend';

function post(
  partial: Partial<ProfilePostItem> & Pick<ProfilePostItem, 'id'>,
): ProfilePostItem {
  return {
    title: '活动',
    content: '正文',
    date: '06/13',
    ...partial,
  };
}

describe('profileTeamPosts', () => {
  it('detects share posts', () => {
    expect(isProfileSharePost(['share'])).toBe(true);
    expect(isProfileSharePost(['team'])).toBe(false);
    expect(isProfileSharePost(['team', 'share'])).toBe(true);
  });

  it('filters share posts from profile team list', () => {
    const items = [
      post({ id: '1', contentTypes: ['team'] }),
      post({ id: '2', contentTypes: ['share'] }),
      post({ id: '3', contentTypes: ['carpool'] }),
    ];
    expect(filterProfileTeamPosts(items).map((item) => item.id)).toEqual(['1', '3']);
  });
});
