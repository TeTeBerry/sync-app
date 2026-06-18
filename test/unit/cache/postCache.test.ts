import { beforeEach, describe, expect, it } from 'vitest';
import {
  getActivityPostsCacheItemCount,
  removePostFromCaches,
} from '@/cache/postCache';
import { setEventPostsPageCache } from '@/cache/eventPostsPageCache';
import { getCacheData, invalidateCache, setCacheData } from '@/hooks/useApiQuery';
import type { InfiniteQueryPage } from '@/hooks/useApiInfiniteQuery';
import type { EventDetailPost, ProfilePostItem } from '@/types/backend';

const postA: ProfilePostItem = {
  id: 'post-a',
  title: 'A',
  content: 'hello',
  date: '2026-01-01',
};

const postB: ProfilePostItem = {
  id: 'post-b',
  title: 'B',
  content: 'world',
  date: '2026-01-02',
};

const activityPostA: EventDetailPost = {
  id: 'post-a',
  name: 'User',
  location: 'Venue',
  body: 'hello',
  tags: ['team'],
  avatar: '',
  createdAt: '2026-01-01T00:00:00.000Z',
};

const activityPostB: EventDetailPost = {
  id: 'post-b',
  name: 'User',
  location: 'Venue',
  body: 'world',
  tags: ['team'],
  avatar: '',
  createdAt: '2026-01-02T00:00:00.000Z',
};

describe('postCache.removePostFromCaches', () => {
  beforeEach(() => {
    invalidateCache(['profile']);
    invalidateCache(['posts']);
  });

  it('removes post from profile posts cache', () => {
    setCacheData<ProfilePostItem[]>(['profile', 'posts'], () => [postA, postB]);

    removePostFromCaches('post-a');

    expect(getCacheData<ProfilePostItem[]>(['profile', 'posts'])).toEqual([postB]);
  });

  it('removes post from activity infinite-query cache', () => {
    setEventPostsPageCache(4, {
      items: [activityPostA, activityPostB],
      hasMore: false,
    });

    removePostFromCaches('post-a');

    expect(getActivityPostsCacheItemCount(4)).toBe(1);
    expect(
      getCacheData<InfiniteQueryPage<EventDetailPost>>([
        'posts',
        'activity',
        4,
        'page',
      ])?.items.map((post) => post.id),
    ).toEqual(['post-b']);
  });
});
