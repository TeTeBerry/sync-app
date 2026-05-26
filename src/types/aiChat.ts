export type AiChatRole = "user" | "assistant" | "system";

export interface AiChatImageContext {
  source?: string;
  ocrText?: string;
}

export interface AiChatMessage {
  role: AiChatRole;
  content: string;
  imageContext?: AiChatImageContext;
}

export type AiChatStreamEvent =
  | { type: "delta"; content: string }
  | {
      type: "done";
      messageId?: string;
      sessionId?: string;
    }
  | {
      type: "post_created";
      postId: string;
      activityLegacyId?: number;
    }
  | {
      type: "existing_post";
      postId: string;
      activityLegacyId?: number;
    }
  | { type: "error"; message: string };

export type ChatUiMessage = {
  id: string;
  from: "ai" | "user";
  text: string;
  imagePreview?: string;
  ocrText?: string;
  streaming?: boolean;
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
