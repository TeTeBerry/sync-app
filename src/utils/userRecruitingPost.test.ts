import { describe, expect, it, vi } from 'vitest';
import {
  findUserRecruitingPostInFeed,
  userHasRecruitingBuddyPost,
  userHasRecruitingPostForActivity,
} from './userRecruitingPost';
import type { EventDetailPost, ProfilePostItem } from '../types/backend';

vi.mock('./postOwnership', () => ({
  isCurrentUserPostAuthor: (name: string, userId?: string) =>
    userId === 'me' || name === '当前用户',
}));

const recruitingPost: EventDetailPost = {
  id: 'p1',
  userId: 'me',
  name: '当前用户',
  location: '上海',
  time: '1h',
  body: '找组队',
  tags: [],
  likes: 0,
  comments: 0,
  avatar: '',
  status: '招募中',
};

describe('userRecruitingPost', () => {
  it('findUserRecruitingPostInFeed returns recruiting own post', () => {
    expect(findUserRecruitingPostInFeed([recruitingPost])?.id).toBe('p1');
    expect(
      findUserRecruitingPostInFeed([
        { ...recruitingPost, id: 'p2', userId: 'other', name: '他人' },
      ]),
    ).toBeUndefined();
  });

  it('userHasRecruitingPostForActivity matches profile posts', () => {
    const profilePosts: ProfilePostItem[] = [
      {
        id: 'pp1',
        title: 'Storm',
        content: '找组队',
        status: '招募中',
        likes: 0,
        comments: 0,
        date: '今天',
        activityLegacyId: 7,
      },
    ];
    expect(userHasRecruitingPostForActivity(profilePosts, 7)).toBe(true);
    expect(userHasRecruitingPostForActivity(profilePosts, 9)).toBe(false);
  });

  it('userHasRecruitingBuddyPost prefers feed then profile', () => {
    expect(userHasRecruitingBuddyPost(7, [recruitingPost], [])).toBe(true);
    expect(
      userHasRecruitingBuddyPost(
        7,
        [],
        [
          {
            id: 'pp1',
            title: 'Storm',
            content: 'x',
            status: '招募中',
            likes: 0,
            comments: 0,
            date: '今天',
            activityLegacyId: 7,
          },
        ],
      ),
    ).toBe(true);
    expect(userHasRecruitingBuddyPost(7, [], [])).toBe(false);
  });
});
