import { describe, expect, it } from 'vitest';
import { normalizeEventPostListItem } from './eventPostNormalize';
import type { EventDetailPost } from '../../../../types/post';

function basePost(overrides: Partial<EventDetailPost> = {}): EventDetailPost {
  return {
    id: 'p1',
    name: '  Mia  ',
    location: '上海',
    time: '2小时前',
    body: 'hello',
    tags: [],
    likes: 1,
    comments: 0,
    avatar: 'https://example.com/a.jpg',
    status: '招募中',
    ...overrides,
  };
}

describe('normalizeEventPostListItem', () => {
  it('trims author name and falls back to 用户', () => {
    const { post } = normalizeEventPostListItem(basePost({ name: '   ' }));
    expect(post.name).toBe('用户');
    expect(normalizeEventPostListItem(basePost()).post.name).toBe('Mia');
  });

  it('prefers createdAt for publishTimeLabel', () => {
    const { publishTimeLabel } = normalizeEventPostListItem(
      basePost({ createdAt: '2026-06-01T12:00:00.000Z', time: 'legacy' }),
    );
    expect(publishTimeLabel).not.toBe('legacy');
    expect(publishTimeLabel.length).toBeGreaterThan(0);
  });
});
