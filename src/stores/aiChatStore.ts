import { create } from 'zustand';
import type { ChatUiMessage } from '../types/aiChat';
import type { ConversationState } from '../types/conversationState';
import type { AiChatScopeKey } from '../utils/aiChatScope';

type AiChatScopeBucket = {
  messages: ChatUiMessage[];
  conversationState: ConversationState | null;
  degraded: boolean;
};

const emptyBucket = (): AiChatScopeBucket => ({
  messages: [],
  conversationState: null,
  degraded: false,
});

function normalizeRestoredMessages(messages: ChatUiMessage[]): ChatUiMessage[] {
  return messages.map((message) =>
    message.streaming ? { ...message, streaming: false } : message,
  );
}

interface AiChatStoreState {
  buckets: Record<AiChatScopeKey, AiChatScopeBucket>;
  activeScopeKey: AiChatScopeKey | null;
  setActiveScope: (scopeKey: AiChatScopeKey) => void;
  getScopeMessages: (scopeKey: AiChatScopeKey) => ChatUiMessage[];
  setScopeMessages: (scopeKey: AiChatScopeKey, messages: ChatUiMessage[]) => void;
  applyConversationPatch: (state: ConversationState) => void;
  setPostRecommendationsMeta: (degraded?: boolean) => void;
  resetScope: (scopeKey: AiChatScopeKey) => void;
  /** @deprecated Prefer resetScope; clears active scope bucket. */
  resetOnClearSession: () => void;
  clearAllEphemeralChat: () => void;
}

function getBucketFromState(
  state: AiChatStoreState,
  scopeKey: AiChatScopeKey,
): AiChatScopeBucket {
  return state.buckets[scopeKey] ?? emptyBucket();
}

function patchActiveBucket(
  state: AiChatStoreState,
  patch: Partial<AiChatScopeBucket>,
): Pick<AiChatStoreState, 'buckets'> {
  const scopeKey = state.activeScopeKey;
  if (!scopeKey) return { buckets: state.buckets };

  const current = getBucketFromState(state, scopeKey);
  return {
    buckets: {
      ...state.buckets,
      [scopeKey]: { ...current, ...patch },
    },
  };
}

export const useAiChatStore = create<AiChatStoreState>((set, get) => ({
  buckets: {},
  activeScopeKey: null,

  setActiveScope: (scopeKey) => set({ activeScopeKey: scopeKey }),

  getScopeMessages: (scopeKey) => {
    const stored = getBucketFromState(get(), scopeKey).messages;
    return stored.length ? normalizeRestoredMessages(stored) : [];
  },

  setScopeMessages: (scopeKey, messages) =>
    set((state) => {
      const current = getBucketFromState(state, scopeKey);
      if (current.messages === messages) return state;
      return {
        buckets: {
          ...state.buckets,
          [scopeKey]: { ...current, messages },
        },
      };
    }),

  applyConversationPatch: (conversationState) =>
    set((state) => patchActiveBucket(state, { conversationState })),

  setPostRecommendationsMeta: (degraded) =>
    set((state) => patchActiveBucket(state, { degraded: degraded === true })),

  resetScope: (scopeKey) =>
    set((state) => ({
      buckets: {
        ...state.buckets,
        [scopeKey]: emptyBucket(),
      },
    })),

  resetOnClearSession: () => {
    const scopeKey = get().activeScopeKey;
    if (!scopeKey) return;
    get().resetScope(scopeKey);
  },

  clearAllEphemeralChat: () =>
    set({
      buckets: {},
      activeScopeKey: null,
    }),
}));

export function selectActiveConversationFlow(state: AiChatStoreState) {
  const scopeKey = state.activeScopeKey;
  if (!scopeKey) return undefined;
  return state.buckets[scopeKey]?.conversationState?.flow;
}

export function selectActiveDegraded(state: AiChatStoreState) {
  const scopeKey = state.activeScopeKey;
  if (!scopeKey) return false;
  return state.buckets[scopeKey]?.degraded === true;
}
