import { describe, expect, it } from 'vitest';
import {
  formatChatMessageTime,
  shouldShowChatMessageTimestamp,
} from '@/components/ai-chat/chatMessageRowTime';
import type { ChatUiMessage } from '@/types/aiChat';

function msg(id: string, from: 'user' | 'ai' = 'ai'): ChatUiMessage {
  return { id, from, text: 'hello' };
}

describe('chatMessageRowTime', () => {
  it('formats message id prefix as local time', () => {
    const ts = new Date(2026, 5, 18, 9, 30).getTime();
    expect(formatChatMessageTime(`${ts}-abc`)).toMatch(/^\d{1,2}:\d{2}$/);
  });

  it('shows timestamp when ids lack parseable time and sender changes', () => {
    expect(
      shouldShowChatMessageTimestamp(msg('abc-a', 'ai'), msg('def-b', 'user')),
    ).toBe(true);
  });

  it('suppresses timestamp within five minutes for same sender', () => {
    const base = 1_700_000_000_000;
    expect(
      shouldShowChatMessageTimestamp(
        msg(`${base}-a`, 'ai'),
        msg(`${base + 60_000}-b`, 'ai'),
      ),
    ).toBe(false);
  });
});
