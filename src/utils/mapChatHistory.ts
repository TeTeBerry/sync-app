import type { ChatMessage } from '@sync/chat-contracts';
import type { ChatSessionMessagesPage } from '../api/sync/chat';
import type { ChatUiMessage } from '../types/aiChat';

export function historyPageStartIndex(page: ChatSessionMessagesPage): number {
  if (page.nextBefore != null) return page.nextBefore;
  return Math.max(0, page.total - page.items.length);
}

export function mapServerMessagesToUi(
  messages: ChatMessage[],
  options?: { startIndex?: number },
): ChatUiMessage[] {
  const startIndex = options?.startIndex ?? 0;
  return messages.map((message, index) => ({
    id: `hist-${startIndex + index}-${message.role}`,
    from: message.role === 'user' ? 'user' : 'ai',
    text: message.content,
    suggestedReplies: message.suggestedReplies,
    recommendedActivity: message.recommendedActivity,
    createdPost: message.createdPost,
  }));
}

export function isWelcomeOnlyMessages(messages: ChatUiMessage[]): boolean {
  return messages.length === 1 && Boolean(messages[0]?.isWelcome);
}
