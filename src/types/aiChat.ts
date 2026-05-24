export type AiChatRole = "user" | "assistant" | "system";

export interface AiChatMessage {
  role: AiChatRole;
  content: string;
}

/** SSE payload from POST /ai/chat */
export type AiChatStreamEvent =
  | { type: "delta"; content: string }
  | { type: "done"; messageId?: string }
  | { type: "error"; message: string };

export type ChatUiMessage = {
  id: string;
  from: "ai" | "user";
  text: string;
  /** True while tokens are still arriving */
  streaming?: boolean;
};
