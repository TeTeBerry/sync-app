import { describe, expect, it } from 'vitest';
import { normalizeEventPostListItem } from '@/domains/partner-feed/utils/eventPostNormalize';
import type { EventDetailPost } from '@/types/post';

function basePost(overrides: Partial<EventDetailPost> = {}): EventDetailPost {
  return {
    id: 'p1',
    name: '  Mia  ',
    location: '上海',
    createdAt: '2026-06-01T10:00:00.000Z',
    body: 'hello',
    tags: [],
    avatar: 'https://example.com/a.jpg',
    ...overrides,
  };
}

describe('normalizeEventPostListItem', () => {
  it('trims author name and falls back to 用户', () => {
    const { post } = normalizeEventPostListItem(basePost({ name: '   ' }));
    expect(post.name).toBe('用户');
    expect(normalizeEventPostListItem(basePost()).post.name).toBe('Mia');
  });

  it('formats publishTimeLabel from createdAt', () => {
    const { publishTimeLabel } = normalizeEventPostListItem(
      basePost({ createdAt: '2026-06-01T12:00:00.000Z' }),
    );
    expect(publishTimeLabel.length).toBeGreaterThan(0);
  });

  it('preserves comments count', () => {
    const { post } = normalizeEventPostListItem(basePost({ comments: 3 }));
    expect(post.comments).toBe(3);
  });
});
