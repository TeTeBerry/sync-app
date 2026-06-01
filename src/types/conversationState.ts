/**
 * Sync with backend manually: `sync-app-backend/src/ai/conversation/conversation-state.types.ts`
 */
export const CONVERSATION_STATE_VERSION = 1;

export type ConversationFlow =
  | 'idle'
  | 'recommend_gate'
  | 'publish_confirm'
  | 'clarify_buddy'
  | 'collect_post_body';

export interface RecommendGateState {
  activityLegacyId?: number;
  shownPostIds?: string[];
  empty?: boolean;
}

export interface PublishDraftState {
  activityLegacyId?: number;
  draftBody?: string;
  fromSelfPost?: boolean;
}

export interface ConversationState {
  version: number;
  flow: ConversationFlow;
  gate?: RecommendGateState;
  publishDraft?: PublishDraftState;
}
