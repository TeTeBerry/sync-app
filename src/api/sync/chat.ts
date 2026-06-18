import { apiDelete, apiGet } from '../../utils/apiClient';
import type { ChatMessage, ConversationState } from '@sync/chat-contracts';

export type ChatSessionMessagesPage = {
  items: ChatMessage[];
  total: number;
  hasMore: boolean;
  nextBefore?: number;
  conversationState: ConversationState;
};

export function fetchChatSessionMessages(
  sessionId: string,
  options?: { limit?: number; before?: number },
) {
  return apiGet<ChatSessionMessagesPage>(`/chat/sessions/${sessionId}/messages`, {
    limit: options?.limit != null ? String(options.limit) : undefined,
    before: options?.before != null ? String(options.before) : undefined,
  });
}

export function clearChatSession(sessionId: string) {
  return apiDelete<{ ok: true; sessionId: string }>(`/chat/sessions/${sessionId}`);
}
