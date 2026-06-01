import { useAiChatStore } from '../../stores/aiChatStore';
import type { AiChatStreamEvent } from '../../types/aiChat';

/** Session-level stream side effects (not per-message UI state). */
export function applyStreamEventToSessionStore(event: AiChatStreamEvent): void {
  const store = useAiChatStore.getState();

  if (event.type === 'conversation_patch') {
    store.applyConversationPatch(event.state);
    return;
  }

  if (event.type === 'post_recommendations') {
    store.setPostRecommendationsMeta(event.degraded);
  }
}
