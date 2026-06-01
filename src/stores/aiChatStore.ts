import { create } from 'zustand';
import type { ConversationState } from '../types/conversationState';

interface AiChatStoreState {
  conversationState: ConversationState | null;
  degraded: boolean;
  applyConversationPatch: (state: ConversationState) => void;
  setPostRecommendationsMeta: (degraded?: boolean) => void;
  resetOnClearSession: () => void;
}

const initialState = {
  conversationState: null as ConversationState | null,
  degraded: false,
};

export const useAiChatStore = create<AiChatStoreState>((set) => ({
  ...initialState,

  applyConversationPatch: (state) => set({ conversationState: state }),

  setPostRecommendationsMeta: (degraded) => set({ degraded: degraded === true }),

  resetOnClearSession: () => set(initialState),
}));
