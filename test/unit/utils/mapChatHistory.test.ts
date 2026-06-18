import { describe, expect, it } from 'vitest';
import {
  historyPageStartIndex,
  isWelcomeOnlyMessages,
  mapServerMessagesToUi,
} from '@/utils/mapChatHistory';

describe('mapChatHistory', () => {
  it('maps server roles to ui messages with stable ids', () => {
    const mapped = mapServerMessagesToUi(
      [
        { role: 'user', content: 'hello' },
        { role: 'assistant', content: 'hi' },
      ],
      { startIndex: 10 },
    );

    expect(mapped).toEqual([
      expect.objectContaining({ id: 'hist-10-user', from: 'user', text: 'hello' }),
      expect.objectContaining({ id: 'hist-11-assistant', from: 'ai', text: 'hi' }),
    ]);
  });

  it('detects welcome-only local state', () => {
    expect(
      isWelcomeOnlyMessages([
        { id: '1', from: 'ai', text: 'welcome', isWelcome: true },
      ]),
    ).toBe(true);
    expect(
      isWelcomeOnlyMessages([
        { id: '1', from: 'ai', text: 'welcome', isWelcome: true },
        { id: '2', from: 'user', text: 'hi' },
      ]),
    ).toBe(false);
  });

  it('derives history page start index from pagination cursor', () => {
    expect(
      historyPageStartIndex({
        items: [{ role: 'user', content: 'a' }],
        total: 50,
        hasMore: true,
        nextBefore: 20,
        conversationState: { version: 1, flow: 'idle' },
      }),
    ).toBe(20);

    expect(
      historyPageStartIndex({
        items: [
          { role: 'user', content: 'a' },
          { role: 'assistant', content: 'b' },
        ],
        total: 2,
        hasMore: false,
        conversationState: { version: 1, flow: 'idle' },
      }),
    ).toBe(0);
  });
});
