import { describe, expect, it } from 'vitest';
import {
  buildBuddySearchReplyText,
  buildBuddySearchWelcomeText,
  eventDetailPostsToRecommendedCards,
} from '@/hooks/useAiBuddySearchChat';
import type { EventDetailPost } from '@/types/backend';

describe('useAiBuddySearchChat helpers', () => {
  it('builds scoped welcome text', () => {
    expect(buildBuddySearchWelcomeText('EDC Korea')).toContain('EDC Korea');
  });

  it('builds reply summary with parsed terms', () => {
    expect(
      buildBuddySearchReplyText({
        searchTerms: ['Techno', '10.3'],
        totalScanned: 12,
        totalMatched: 2,
      }),
    ).toContain('解析关键词：Techno、10.3');
  });

  it('maps event posts to assistant cards', () => {
    const post: EventDetailPost = {
      id: 'p1',
      name: 'Mia',
      location: '主舞台',
      body: 'Techno 组队',
      tags: ['#组队'],
      avatar: '',
    };
    const cards = eventDetailPostsToRecommendedCards([post], 4, 'EDC Korea');
    expect(cards[0]?.postId).toBe('p1');
    expect(cards[0]?.eventTitle).toBe('EDC Korea');
    expect(cards[0]?.authorName).toBe('Mia');
  });
});
