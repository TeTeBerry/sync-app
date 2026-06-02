import type { ChatUiMessage } from '../types/aiChat';

/** Update one message by id; reuse other row references for memoized children. */
export function patchChatMessage(
  messages: ChatUiMessage[],
  messageId: string,
  patch: Partial<ChatUiMessage> | ((current: ChatUiMessage) => ChatUiMessage),
): ChatUiMessage[] {
  const index = messages.findIndex((m) => m.id === messageId);
  if (index < 0) return messages;

  const current = messages[index];
  const next = typeof patch === 'function' ? patch(current) : { ...current, ...patch };

  if (next === current) return messages;
  if (
    typeof patch !== 'function' &&
    Object.keys(patch).every(
      (key) =>
        patch[key as keyof ChatUiMessage] === current[key as keyof ChatUiMessage],
    )
  ) {
    return messages;
  }

  const copy = messages.slice();
  copy[index] = next;
  return copy;
}
