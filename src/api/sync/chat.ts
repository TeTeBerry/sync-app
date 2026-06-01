import { apiDelete, apiGet } from '../../utils/apiClient';
import type { ChatSessionRecord } from '../../types/aiChat';

export function fetchChatSession(sessionId: string) {
  return apiGet<ChatSessionRecord>(`/chat/sessions/${sessionId}`);
}

export function clearChatSession(sessionId: string) {
  return apiDelete<{ ok: true; sessionId: string }>(`/chat/sessions/${sessionId}`);
}
