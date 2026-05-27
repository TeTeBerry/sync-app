import type { ConversationState } from "./conversationState";

export type AiChatRole = "user" | "assistant" | "system";

export interface AiChatImageContext {
  source?: string;
  ocrText?: string;
}

export interface AiChatMessage {
  role: AiChatRole;
  content: string;
  imageContext?: AiChatImageContext;
  recommendedPosts?: RecommendedPostCard[];
  createdPost?: RecommendedPostCard;
  suggestedReplies?: string[];
}

export type RecommendedPostAuthorGender = "female" | "male";

export interface RecommendedPostCard {
  postId: string;
  snippet: string;
  authorName: string;
  authorHandle?: string;
  authorAvatar?: string;
  authorGender?: RecommendedPostAuthorGender;
  eventTitle: string;
  location?: string;
  tags?: string[];
  activityLegacyId?: number;
  matchReason?: string;
}

export type AiChatStreamEvent =
  | { type: "delta"; content: string }
  | {
      type: "message_complete";
      content: string;
      requestId?: string;
    }
  | {
      type: "done";
      messageId?: string;
      sessionId?: string;
    }
  | {
      type: "post_created";
      postId: string;
      activityLegacyId?: number;
      post?: RecommendedPostCard;
    }
  | {
      type: "existing_post";
      postId: string;
      activityLegacyId?: number;
    }
  | {
      type: "post_recommendations";
      posts: RecommendedPostCard[];
      degraded?: boolean;
    }
  | {
      type: "suggested_replies";
      replies: string[];
    }
  | {
      /** Sync with backend manually — see `types/conversationState.ts` */
      type: "conversation_patch";
      state: ConversationState;
    }
  | { type: "error"; message: string };

export type ChatUiMessage = {
  id: string;
  from: "ai" | "user";
  text: string;
  imagePreview?: string;
  ocrText?: string;
  streaming?: boolean;
  recommendedPosts?: RecommendedPostCard[];
  /** Post card shown after user successfully publishes from chat */
  createdPost?: RecommendedPostCard;
  suggestedReplies?: string[];
};

export interface SendChatOptions {
  text: string;
  image?: string;
}

export interface ChatSessionRecord {
  sessionId: string;
  userId?: string;
  history?: AiChatMessage[];
}
