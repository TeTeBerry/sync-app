import type { AiChatMessage, AiChatStreamEvent } from '../../types/aiChat';

export interface AiChatWsSendPayload {
  messages: AiChatMessage[];
  sessionId?: string;
  userId?: string;
  userName?: string;
  userPhone?: string;
  activityLegacyId?: number;
  image?: string;
  images?: string[];
}

export interface StreamAiChatWsOptions extends AiChatWsSendPayload {
  url?: string;
  headers?: Record<string, string>;
  signal?: AbortSignal;
}

export type WsQueueItem =
  | { kind: 'event'; event: AiChatStreamEvent }
  | { kind: 'error'; error: Error }
  | { kind: 'close' };
