import { describe, expect, it } from 'vitest';
import { eventDetailPostToCard } from '@/utils/eventPostCard';

describe('eventDetailPostToCard', () => {
  it('maps API post to chat card', () => {
    const card = eventDetailPostToCard(
      {
        id: 'p1',
        name: '风暴电音节',
        location: '上海',
        createdAt: '2026-06-01T10:00:00.000Z',
        body: '2人 拼房',
        tags: ['#拼房'],
        likes: 0,
        comments: 0,
        avatar: 'a.png',
        status: '招募中',
      },
      {
        activityLegacyId: 9,
        authorName: 'Berry',
        authorAvatar: 'user.png',
      },
    );

    expect(card).toEqual({
      postId: 'p1',
      snippet: '2人 拼房',
      authorName: 'Berry',
      authorAvatar: 'user.png',
      eventTitle: '风暴电音节',
      location: '上海',
      tags: ['#拼房'],
      activityLegacyId: 9,
    });
  });
});
