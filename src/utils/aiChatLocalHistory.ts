import Taro from '@tarojs/taro';
import type { ChatUiMessage } from '../types/aiChat';

const STORAGE_PREFIX = 'sync_ai_chat_history_';

function storageKey(sessionId: string): string {
  return `${STORAGE_PREFIX}${sessionId.trim()}`;
}

function isPersistableMessage(message: ChatUiMessage): boolean {
  if (message.streaming) return false;
  return Boolean(
    message.text?.trim() ||
      message.imagePreview ||
      message.ocrText ||
      message.recommendedPosts?.length ||
      message.recommendedActivity ||
      message.createdPost ||
      message.suggestedReplies?.length ||
      message.travelGuide,
  );
}

export function readLocalChatHistory(sessionId: string): ChatUiMessage[] | null {
  if (!sessionId.trim()) return null;
  try {
    const raw = Taro.getStorageSync(storageKey(sessionId));
    if (!Array.isArray(raw)) return null;
    return raw.filter(
      (item): item is ChatUiMessage =>
        Boolean(item) &&
        typeof item === 'object' &&
        typeof (item as ChatUiMessage).id === 'string' &&
        ((item as ChatUiMessage).from === 'user' || (item as ChatUiMessage).from === 'ai'),
    );
  } catch {
    return null;
  }
}

export function writeLocalChatHistory(
  sessionId: string,
  messages: ChatUiMessage[],
): void {
  if (!sessionId.trim()) return;
  const payload = messages.filter(isPersistableMessage);
  if (!payload.some((m) => m.from === 'user')) return;

  try {
    Taro.setStorageSync(storageKey(sessionId), payload);
  } catch {
    // storage full or unavailable
  }
}

export function clearLocalChatHistory(sessionId: string): void {
  if (!sessionId.trim()) return;
  try {
    Taro.removeStorageSync(storageKey(sessionId));
  } catch {
    // ignore
  }
}
