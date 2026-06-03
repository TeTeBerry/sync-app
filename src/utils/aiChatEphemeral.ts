import { closeAiChatWsConnection } from './aiChatWs';
import { clearAllPersistedAiSessionIds } from './session';
import { useAiChatStore } from '../stores/aiChatStore';

/** Clear AI dialog UI state and persisted session ids when the user leaves the mini program. */
export function clearAiChatEphemeralState(reason = 'app hide'): void {
  closeAiChatWsConnection(reason);
  useAiChatStore.getState().clearAllEphemeralChat();
  clearAllPersistedAiSessionIds();
}
