import { describe, expect, it } from 'vitest';
import {
  extractDepartureCityOptions,
  filterEventDetailPostsByRules,
} from '@/domains/partner-feed/utils/filterEventDetailPostsByRules';
import type { EventDetailPost } from '@/types/post';

function makePost(
  partial: Partial<EventDetailPost> & Pick<EventDetailPost, 'id'>,
): EventDetailPost {
  return {
    id: partial.id,
    name: partial.name ?? '用户',
    location: partial.location ?? '',
    body: partial.body ?? '',
    tags: partial.tags ?? [],
    avatar: partial.avatar ?? '',
    ...partial,
  };
}

describe('filterEventDetailPostsByRules', () => {
  const posts = [
    makePost({
      id: '1',
      departureCity: '上海',
      body: '3月15日出发',
      location: '上海',
    }),
    makePost({
      id: '2',
      departureCity: '北京',
      body: '周末场求搭子',
      location: '北京',
    }),
  ];

  it('extracts departure city options', () => {
    expect(extractDepartureCityOptions(posts)).toEqual(
      expect.arrayContaining(['上海', '北京']),
    );
    expect(extractDepartureCityOptions(posts).length).toBe(2);
  });

  it('filters by departure city', () => {
    const filtered = filterEventDetailPostsByRules(posts, { departureCity: '上海' });
    expect(filtered.map((post) => post.id)).toEqual(['1']);
  });

  it('filters by date keyword in body', () => {
    const filtered = filterEventDetailPostsByRules(posts, { dateKeyword: '3月' });
    expect(filtered.map((post) => post.id)).toEqual(['1']);
  });
});
