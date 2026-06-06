import { describe, expect, it } from 'vitest';
import type { ChatUiMessage } from '@/types/aiChat';
import { patchChatMessage } from '@/utils/chatMessages';

function msg(id: string, text: string): ChatUiMessage {
  return { id, from: 'ai', text, streaming: false };
}

describe('patchChatMessage', () => {
  it('returns same array when text unchanged', () => {
    const messages = [msg('a', 'hi')];
    const next = patchChatMessage(messages, 'a', { text: 'hi' });
    expect(next).toBe(messages);
  });

  it('updates one row and preserves other references', () => {
    const a = msg('a', '1');
    const b = msg('b', '2');
    const messages = [a, b];
    const next = patchChatMessage(messages, 'a', { text: '1+' });
    expect(next).not.toBe(messages);
    expect(next[0].text).toBe('1+');
    expect(next[1]).toBe(b);
  });
});
