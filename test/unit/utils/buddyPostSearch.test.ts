import { describe, expect, it } from 'vitest';
import type { EventDetailPost } from '@/types/backend';
import {
  filterEventDetailPostsByQuery,
  fuzzyTextMatches,
  resolveBuddySearchTerms,
} from '@/utils/buddyPostSearch';

function samplePost(overrides: Partial<EventDetailPost> = {}): EventDetailPost {
  return {
    id: 'p1',
    name: 'Mia',
    location: '主舞台',
    body: '10.3 白天在场，喜欢 Techno，找 2 人同逛舞台',
    tags: ['#组队'],
    avatar: '',
    ...overrides,
  };
}

describe('buddyPostSearch', () => {
  it('tokenizes search query into terms', () => {
    expect(resolveBuddySearchTerms('Techno 组队')).toEqual(['Techno', '组队']);
  });

  it('supports fuzzy character subsequence matching', () => {
    expect(fuzzyTextMatches('上海出发组队', '上组')).toBe(true);
  });

  it('filters posts by body, tags, and location', () => {
    const posts = [
      samplePost({ id: 'match', body: 'Techno 组队' }),
      samplePost({ id: 'miss', body: 'House 随缘' }),
    ];

    const filtered = filterEventDetailPostsByQuery(posts, 'Techno');
    expect(filtered.map((post) => post.id)).toEqual(['match']);
  });

  it('matches date keywords in post content', () => {
    const posts = [
      samplePost({ id: 'match', body: '3月15日出发' }),
      samplePost({ id: 'miss', body: '周末场求搭子' }),
    ];

    const filtered = filterEventDetailPostsByQuery(posts, '3月');
    expect(filtered.map((post) => post.id)).toEqual(['match']);
  });

  it('requires every token to match', () => {
    const posts = [
      samplePost({ id: 'both', body: 'Techno 上海组队', location: '上海' }),
      samplePost({ id: 'one', body: 'Techno 组队', location: '北京' }),
    ];

    const filtered = filterEventDetailPostsByQuery(posts, 'Techno 上海');
    expect(filtered.map((post) => post.id)).toEqual(['both']);
  });

  it('does not match unrelated posts that only share the activity context', () => {
    const posts = [
      samplePost({ id: 'match', body: 'EDC Thailand 攻略分享' }),
      samplePost({ id: 'miss', body: '组队，12.18-12.20，上海，2 人' }),
    ];

    const filtered = filterEventDetailPostsByQuery(posts, 'EDC');
    expect(filtered.map((post) => post.id)).toEqual(['match']);
  });

  it('still matches when budget token is missing from post body', () => {
    const posts = [
      samplePost({
        id: 'match',
        body: '上海出发 12.11-12.13 差 1 人',
        location: '上海',
      }),
      samplePost({
        id: 'miss',
        body: '北京出发 12.11-12.13 差 1 人',
        location: '北京',
      }),
    ];

    const filtered = filterEventDetailPostsByQuery(
      posts,
      '上海 12.11-12.13 差 1 人 舒适(¥300-600)',
    );
    expect(filtered.map((post) => post.id)).toEqual(['match']);
  });
});
