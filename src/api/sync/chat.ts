import { apiDelete } from '../../utils/apiClient';

export function clearChatSession(sessionId: string) {
  return apiDelete<{ ok: true; sessionId: string }>(`/chat/sessions/${sessionId}`);
}
