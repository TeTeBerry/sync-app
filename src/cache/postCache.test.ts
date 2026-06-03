import { beforeEach, describe, expect, it } from 'vitest';
import { resolveRequestUserId } from '../api/requestContext';
import {
  getPopularPostsFromCache,
  patchPostEngagementInCaches,
  popularPostsQueryKey,
  setPopularPostsCache,
} from './postCache';
import type { HomeFeedPost } from '../types/backend';

const userId = resolveRequestUserId();

const samplePost: HomeFeedPost = {
  id: 'post-1',
  name: 'A',
  handle: '@a',
  event: 'Fest',
  body: 'body',
  time: '1m',
  likes: 1,
  liked: false,
  comments: 0,
  status: '招募中',
};

describe('postCache', () => {
  beforeEach(() => {
    setPopularPostsCache([samplePost], userId);
  });

  it('popularPostsQueryKey is stable per user', () => {
    expect(popularPostsQueryKey(userId)).toEqual(['posts', 'popular', userId]);
  });

  it('patchPostEngagementInCaches updates popular feed only', () => {
    patchPostEngagementInCaches({
      id: 'post-1',
      likes: 2,
      liked: true,
      comments: 0,
    });
    const cached = getPopularPostsFromCache(userId)?.[0];
    expect(cached?.likes).toBe(2);
    expect(cached?.liked).toBe(true);
  });
});
