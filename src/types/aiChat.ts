/**
 * Chat UI types. Stream/card contracts: `sync-app-backend/src/shared/chat/`.
 */
import type {
  ChatMessage as AiChatMessage,
  RecommendedActivityCard,
  RecommendedPostCard,
} from '@sync/chat-contracts';
import type { ConversationState } from './conversationState';
import type { AiChatProgressKind } from '../constants/aiChatProgress';
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
  streaming?: boolean;
  /** Unified in-progress label for async capabilities (lineup, guide, etc.). */
  progressKind?: AiChatProgressKind;
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
  /** 展示「生成出行攻略」表单入口（替代示例快捷回复） */
  showTravelGuideSheetCta?: boolean;
  /** 展示「组队发帖」表单入口（由 client_action 驱动） */
  showBuddyPostSheetCta?: boolean;
  /** 展示「生成专属行程」入口 */
  showItinerarySheetCta?: boolean;
  /** 展示「开始人格测试」入口 */
  showPersonalityTestSheetCta?: boolean;
  /** 首屏欢迎消息，展示能力发现 chips 时不过滤组队发帖等标签 */
  isWelcome?: boolean;
  /** 离题引导 chips，展示逻辑同 isWelcome，绕过 checklist 去重过滤 */
  isPrepGuidance?: boolean;
};

export interface SendChatOptions {
  text: string;
}

export interface ChatSessionRecord {
  sessionId: string;
  userId?: string;
  history?: AiChatMessage[];
  conversationState?: ConversationState;
}
