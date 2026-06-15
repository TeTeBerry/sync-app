import { describe, expect, it } from 'vitest';
import type { EventDetailPost } from '@/types/post';
import {
  fuzzyTextMatches,
  messageBoardPostMatchesQuery,
} from '@/domains/partner-feed/utils/messageBoardPostSearch';

const samplePost: EventDetailPost = {
  id: 'p1',
  body: '还有人一起吗，上海出发组队',
  name: '微信用户',
  location: '上海',
  tags: ['#组队'],
  contentTypes: ['team'],
  likes: 0,
  comments: 1,
  liked: false,
};

describe('messageBoardPostSearch', () => {
  it('matches body substring', () => {
    expect(messageBoardPostMatchesQuery(samplePost, '一起')).toBe(true);
  });

  it('fuzzy-matches non-consecutive characters in body', () => {
    expect(messageBoardPostMatchesQuery(samplePost, '上组')).toBe(true);
    expect(messageBoardPostMatchesQuery(samplePost, '还吗')).toBe(true);
  });

  it('does not match author name', () => {
    expect(messageBoardPostMatchesQuery(samplePost, '微信')).toBe(false);
  });

  it('matches content type label', () => {
    expect(messageBoardPostMatchesQuery(samplePost, '组队')).toBe(true);
  });

  it('returns false when no field matches', () => {
    expect(messageBoardPostMatchesQuery(samplePost, '拼房')).toBe(false);
  });

  it('empty query matches all', () => {
    expect(fuzzyTextMatches('任意文本', '')).toBe(true);
    expect(messageBoardPostMatchesQuery(samplePost, '   ')).toBe(true);
  });
});
