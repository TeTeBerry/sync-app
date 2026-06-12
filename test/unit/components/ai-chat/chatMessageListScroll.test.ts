import { describe, expect, it } from 'vitest';
import { shouldSuppressAutoScrollForMessage } from '@/components/ai-chat/chatMessageListScroll';
import type { ChatUiMessage } from '@/types/aiChat';

describe('shouldSuppressAutoScrollForMessage', () => {
  it('suppresses when created post card is present', () => {
    const msg: ChatUiMessage = {
      id: '1',
      from: 'ai',
      text: '已发布组队帖',
      createdPost: {
        postId: 'p1',
        snippet: '求组队',
        authorName: 'A',
        eventTitle: '活动',
      },
    };
    expect(shouldSuppressAutoScrollForMessage(msg)).toBe(true);
  });

  it('suppresses for activity recommendation and travel guide', () => {
    expect(
      shouldSuppressAutoScrollForMessage({
        id: '1',
        from: 'ai',
        text: '推荐活动',
        recommendedActivity: {
          activityLegacyId: 1,
          title: 'Storm',
          date: '2026-01-01',
          venue: '深圳',
        },
      }),
    ).toBe(true);

    expect(
      shouldSuppressAutoScrollForMessage({
        id: '2',
        from: 'ai',
        text: '攻略已生成',
        travelGuide: {
          imagePath: '/tmp/guide.png',
          form: {
            departure: '上海',
            headcount: 2,
            budgetTier: 'standard',
            accommodationNights: 2,
            selfDrive: false,
          },
          plan: {
            activityName: 'Storm',
            venue: '深圳',
            eventDates: '2026-01-01',
            departure: '上海',
            headcount: 2,
            budgetLabel: '舒适',
            accommodationNights: 2,
            selfDrive: false,
            transport: { title: '', lines: [] },
            accommodation: { title: '', hotels: [] },
            nightlife: { title: '', spots: [] },
            tips: { title: '', items: [] },
          },
        },
      }),
    ).toBe(true);
  });

  it('does not suppress for plain streaming text', () => {
    expect(
      shouldSuppressAutoScrollForMessage({
        id: '1',
        from: 'ai',
        text: '正在搜索…',
        streaming: true,
      }),
    ).toBe(false);
  });
});
