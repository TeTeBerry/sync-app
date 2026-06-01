/**
 * Chat UI types. Stream/card contracts: `sync-app-backend/src/shared/chat/`.
 */
import type {
  AiStreamEvent as AiChatStreamEvent,
  RecommendedActivityCard,
  RecommendedPostCard,
} from '@sync/chat-contracts';
import type { ConversationState } from './conversationState';
import type { TravelGuideChatPayload } from './travelGuide';

export type {
  AiChatStreamEvent,
  RecommendedActivityCard,
  RecommendedPostAuthorGender,
  RecommendedPostCard,
} from '@sync/chat-contracts';

export type { ConversationState };

export type AiChatRole = 'user' | 'assistant' | 'system';

export interface AiChatImageContext {
  source?: string;
  ocrText?: string;
}

export interface AiChatMessage {
  role: AiChatRole;
  content: string;
  imageContext?: AiChatImageContext;
  recommendedPosts?: RecommendedPostCard[];
  recommendedActivity?: RecommendedActivityCard;
  createdPost?: RecommendedPostCard;
  suggestedReplies?: string[];
}

export type ChatUiMessage = {
  id: string;
  from: 'ai' | 'user';
  text: string;
  imagePreview?: string;
  ocrText?: string;
  streaming?: boolean;
  recommendedPosts?: RecommendedPostCard[];
  recommendedActivity?: RecommendedActivityCard;
  createdPost?: RecommendedPostCard;
  suggestedReplies?: string[];
  travelGuide?: TravelGuideChatPayload;
};

export interface SendChatOptions {
  text: string;
  image?: string;
  images?: string[];
}

export interface ChatSessionRecord {
  sessionId: string;
  userId?: string;
  history?: AiChatMessage[];
  conversationState?: ConversationState;
}
