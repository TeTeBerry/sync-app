export type AiChatRole = "user" | "assistant" | "system";

export interface AiChatMessage {
  role: AiChatRole;
  content: string;
}

/** SSE payload from POST /ai/chat */
export interface TicketCreatedCard {
  id: string;
  type: "sell" | "buy";
  event: string;
  seat: string;
  price: number;
  eventDate?: string;
}

export interface PindanJoinCard {
  legacyId: number;
  activityLegacyId?: number;
  category: "package" | "hotel" | "transport";
  title: string;
  subtitle?: string;
  date: string;
  location: string;
  price: number;
  activityId?: string;
}

export type AiChatStreamEvent =
  | { type: "delta"; content: string }
  | {
      type: "done";
      messageId?: string;
      sessionId?: string;
      ticketId?: string;
      ticketCard?: TicketCreatedCard;
      pindanCard?: PindanJoinCard;
    }
  | { type: "error"; message: string };

export type ChatUiMessage = {
  id: string;
  from: "ai" | "user";
  text: string;
  /** True while tokens are still arriving */
  streaming?: boolean;
  ticketCard?: TicketCreatedCard;
  pindanCard?: PindanJoinCard;
};

export interface ChatSessionRecord {
  sessionId: string;
  userId?: string;
  history?: AiChatMessage[];
}
