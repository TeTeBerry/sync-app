import { describe, expect, it } from 'vitest';
import {
  findBuddyPostInChatMessages,
  findTravelGuideInChatMessages,
  hasRegisteredActivityInChatMessages,
} from '@/domains/festival-plan/festivalPlanFromChat';
import type { ChatUiMessage } from '@/types/aiChat';

describe('festivalPlanFromChat', () => {
  it('finds latest travel guide payload in chat', () => {
    const messages: ChatUiMessage[] = [
      {
        id: 'g1',
        from: 'ai',
        text: 'old',
        travelGuide: {
          guideId: 'g1',
          plan: {} as never,
          form: {} as never,
        },
      },
      {
        id: 'g2',
        from: 'ai',
        text: 'new',
        travelGuide: {
          guideId: 'g2',
          plan: {} as never,
          form: {} as never,
        },
      },
    ];

    expect(findTravelGuideInChatMessages(messages)).toEqual({ guideId: 'g2' });
  });

  it('finds created post in chat', () => {
    const messages: ChatUiMessage[] = [
      {
        id: 'm1',
        from: 'ai',
        text: 'posted',
        createdPost: {
          postId: 'p1',
          snippet: '求组队',
          authorName: 'Zara',
          eventTitle: 'EDC',
        },
      },
    ];

    expect(findBuddyPostInChatMessages(messages)).toEqual({ postId: 'p1' });
  });

  it('detects registration event in chat', () => {
    const messages: ChatUiMessage[] = [
      {
        id: 'm1',
        from: 'ai',
        text: 'ok',
        registeredActivity: {
          activityLegacyId: 4,
          attendees: 12,
        },
      },
    ];

    expect(hasRegisteredActivityInChatMessages(messages, 4)).toBe(true);
    expect(hasRegisteredActivityInChatMessages(messages, 9)).toBe(false);
  });
});
