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

  it('requires every token to match', () => {
    const posts = [
      samplePost({ id: 'both', body: 'Techno 上海组队', location: '上海' }),
      samplePost({ id: 'one', body: 'Techno 组队', location: '北京' }),
    ];

    const filtered = filterEventDetailPostsByQuery(posts, 'Techno 上海');
    expect(filtered.map((post) => post.id)).toEqual(['both']);
  });
});
