import { describe, expect, it } from 'vitest';
import { buildLlmChatHistory, CHAT_LLM_CONTEXT_TURNS } from '@/utils/aiChatHistory';
import type { ChatUiMessage } from '@/types/aiChat';

function uiMessage(
  partial: Partial<ChatUiMessage> & Pick<ChatUiMessage, 'id' | 'from'>,
): ChatUiMessage {
  return {
    text: '',
    ...partial,
  };
}

describe('buildLlmChatHistory', () => {
  it('includes recent user and assistant turns', () => {
    const history = buildLlmChatHistory([
      uiMessage({ id: '1', from: 'ai', text: '你好', isWelcome: true }),
      uiMessage({ id: '2', from: 'user', text: '组队' }),
      uiMessage({ id: '3', from: 'ai', text: '几个人？' }),
      uiMessage({ id: '4', from: 'user', text: '2人' }),
      uiMessage({ id: '5', from: 'ai', text: '', streaming: true }),
    ]);

    expect(history).toEqual([
      { role: 'user', content: '组队' },
      { role: 'assistant', content: '几个人？' },
      { role: 'user', content: '2人' },
    ]);
  });

  it('truncates to CHAT_LLM_CONTEXT_TURNS', () => {
    const messages: ChatUiMessage[] = [
      uiMessage({ id: 'w', from: 'ai', text: 'welcome', isWelcome: true }),
    ];
    for (let turn = 0; turn < CHAT_LLM_CONTEXT_TURNS + 2; turn += 1) {
      messages.push(
        uiMessage({ id: `u-${turn}`, from: 'user', text: `u${turn}` }),
        uiMessage({ id: `a-${turn}`, from: 'ai', text: `a${turn}` }),
      );
    }

    const history = buildLlmChatHistory(messages);
    const userTurns = history.filter((message) => message.role === 'user');
    expect(userTurns).toHaveLength(CHAT_LLM_CONTEXT_TURNS);
    expect(userTurns[0]?.content).toBe('u2');
    expect(userTurns.at(-1)?.content).toBe(`u${CHAT_LLM_CONTEXT_TURNS + 1}`);
  });
});
