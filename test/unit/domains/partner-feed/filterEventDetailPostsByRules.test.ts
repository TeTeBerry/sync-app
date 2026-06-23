import { describe, expect, it } from 'vitest';
import {
  extractDepartureCityOptions,
  filterEventDetailPostsByRules,
  pickInlineDepartureCities,
  rankDepartureCitiesByPostCount,
} from '@/domains/partner-feed/utils/filterEventDetailPostsByRules';
import type { EventDetailPost } from '@/types/partner';

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

  it('ranks departure cities by post count', () => {
    const many = [
      makePost({ id: '1', departureCity: '上海' }),
      makePost({ id: '2', departureCity: '上海' }),
      makePost({ id: '3', departureCity: '北京' }),
    ];
    expect(rankDepartureCitiesByPostCount(many)).toEqual(['上海', '北京']);
  });

  it('pins selected city in inline chips when it is outside top slots', () => {
    const ranked = ['上海', '北京', '成都', '广州', '杭州', '南京'];
    const { inlineCities, hasOverflow } = pickInlineDepartureCities(ranked, '南京');
    expect(hasOverflow).toBe(true);
    expect(inlineCities).toEqual(['南京', '上海', '北京', '成都', '广州']);
  });

  it('shows all cities inline when within limit', () => {
    const ranked = ['上海', '北京', '成都'];
    const { inlineCities, hasOverflow } = pickInlineDepartureCities(ranked, '');
    expect(hasOverflow).toBe(false);
    expect(inlineCities).toEqual(['上海', '北京', '成都']);
  });

  it('filters by departure city', () => {
    const filtered = filterEventDetailPostsByRules(posts, { departureCity: '上海' });
    expect(filtered.map((post) => post.id)).toEqual(['1']);
  });

  it('filters by date keyword in body', () => {
    const filtered = filterEventDetailPostsByRules(posts, { dateKeyword: '3月' });
    expect(filtered.map((post) => post.id)).toEqual(['1']);
  });

  it('filters recruiting only by structured recruitStatus', () => {
    const withStatus = [
      makePost({ id: 'open', recruitStatus: 'open', body: '求搭子' }),
      makePost({ id: 'full', recruitStatus: 'full', body: '已满员' }),
    ];
    const filtered = filterEventDetailPostsByRules(withStatus, {
      recruitingOnly: true,
    });
    expect(filtered.map((post) => post.id)).toEqual(['open']);
  });

  it('filters recruiting only from body when recruitStatus is missing', () => {
    const withBody = [
      makePost({ id: 'open', body: '差2人，上海出发' }),
      makePost({ id: 'full', body: '已满，北京出发' }),
    ];
    const filtered = filterEventDetailPostsByRules(withBody, { recruitingOnly: true });
    expect(filtered.map((post) => post.id)).toEqual(['open']);
  });

  it('combines recruiting only with departure city', () => {
    const mixed = [
      makePost({
        id: '1',
        departureCity: '上海',
        recruitStatus: 'open',
        body: '上海出发',
      }),
      makePost({
        id: '2',
        departureCity: '上海',
        recruitStatus: 'full',
        body: '已满',
      }),
      makePost({
        id: '3',
        departureCity: '北京',
        recruitStatus: 'open',
        body: '北京出发',
      }),
    ];
    const filtered = filterEventDetailPostsByRules(mixed, {
      departureCity: '上海',
      recruitingOnly: true,
    });
    expect(filtered.map((post) => post.id)).toEqual(['1']);
  });
});
