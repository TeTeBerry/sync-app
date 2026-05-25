export type AiChatRole = "user" | "assistant" | "system";

export interface AiChatImageContext {
  /** 可重放的图片引用，优先 URL，其次 base64/data URL */
  source?: string;
  /** OCR 识别结果，便于恢复会话时重建上下文 */
  ocrText?: string;
}

export interface AiChatMessage {
  role: AiChatRole;
  content: string;
  imageContext?: AiChatImageContext;
  pindanCard?: PindanJoinCard;
  ticketCard?: TicketCreatedCard;
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
  remark?: string;
  date: string;
  location: string;
  price: number;
  pricePerPerson?: number;
  budgetMin?: number;
  budgetMax?: number;
  budgetRangeLabel?: string;
  activityId?: string;
  userJoined?: boolean;
  isOwner?: boolean;
  joined?: number;
  total?: number;
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
  /** 用户上传的门票截图预览 */
  imagePreview?: string;
  /** OCR 结果，恢复会话时可重建上下文 */
  ocrText?: string;
  /** True while tokens are still arriving */
  streaming?: boolean;
  ticketCard?: TicketCreatedCard;
  pindanCard?: PindanJoinCard;
};

export interface SendChatOptions {
  text: string;
  image?: string;
  freshSession?: boolean;
}

export interface ChatSessionRecord {
  sessionId: string;
  userId?: string;
  history?: AiChatMessage[];
}
