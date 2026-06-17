/**
 * Chat UI types. Stream/card contracts: `sync-app-backend/src/shared/chat/`.
 */
import type {
  ChatMessage as AiChatMessage,
  RecommendedActivityCard,
  RecommendedPostCard,
} from '@sync/chat-contracts';
import type { ConversationState } from './conversationState';
import type { TravelGuideChatPayload } from './travelGuide';
import type { GenerateItineraryResult } from './itinerary';
import type { PersonalityTestResult } from '../domains/personality-test/types';

export type {
  AiStreamEvent as AiChatStreamEvent,
  ChatMessage as AiChatMessage,
  ChatMessageImageContext as AiChatImageContext,
  ChatMessageRole as AiChatRole,
  RecommendedActivityCard,
  RecommendedPostAuthorGender,
  RecommendedPostCard,
} from '@sync/chat-contracts';

export type { ConversationState };

export type ItineraryChatPayload = {
  itineraryId: string;
  activityLegacyId: number;
  selectedDjIds: string[];
  result: GenerateItineraryResult;
};

export type PersonalityChatPayload = {
  resultId: string;
  result: PersonalityTestResult;
};

export type ChatUiMessage = {
  id: string;
  from: 'ai' | 'user';
  text: string;
  imagePreview?: string;
  ocrText?: string;
  streaming?: boolean;
  recommendedActivity?: RecommendedActivityCard;
  createdPost?: RecommendedPostCard;
  matchedPosts?: RecommendedPostCard[];
  suggestedReplies?: string[];
  travelGuide?: TravelGuideChatPayload;
  itinerary?: ItineraryChatPayload;
  personalityResult?: PersonalityChatPayload;
  registeredActivity?: {
    activityLegacyId: number;
    title?: string;
    attendees: number;
    alreadyRegistered?: boolean;
  };
  /** 展示「AI出行攻略」表单入口（替代示例快捷回复） */
  showTravelGuideSheetCta?: boolean;
  /** 展示「组队发帖」表单入口（由 client_action 驱动） */
  showBuddyPostSheetCta?: boolean;
  /** 展示「专属行程」入口 */
  showItinerarySheetCta?: boolean;
  /** 展示「Raver 人格测试」入口 */
  showPersonalityTestSheetCta?: boolean;
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
