import { create } from "zustand";
import type { ConversationState } from "../types/conversationState";

interface AiChatStoreState {
  conversationState: ConversationState | null;
  suggestedReplies: string[];
  degraded: boolean;
  applyConversationPatch: (state: ConversationState) => void;
  setSuggestedReplies: (replies: string[]) => void;
  setPostRecommendationsMeta: (degraded?: boolean) => void;
  resetOnClearSession: () => void;
}

const initialState = {
  conversationState: null as ConversationState | null,
  suggestedReplies: [] as string[],
  degraded: false,
};

export const useAiChatStore = create<AiChatStoreState>((set) => ({
  ...initialState,

  applyConversationPatch: (state) => set({ conversationState: state }),

  setSuggestedReplies: (replies) => set({ suggestedReplies: replies }),

  setPostRecommendationsMeta: (degraded) => set({ degraded: degraded === true }),

  resetOnClearSession: () => set(initialState),
}));
