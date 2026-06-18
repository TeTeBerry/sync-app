import type { ChatUiMessage } from '../../types/aiChat';

const TIMESTAMP_GAP_MS = 5 * 60 * 1000;

function messageTimestampMs(id: string): number | null {
  const ts = Number(id.split('-')[0]);
  if (!Number.isFinite(ts) || ts <= 0) return null;
  return ts;
}

export function formatChatMessageTime(id: string): string | null {
  const ts = messageTimestampMs(id);
  if (ts == null) return null;
  const date = new Date(ts);
  return date.toLocaleTimeString([], {
    hour: '2-digit',
    minute: '2-digit',
    hour12: false,
  });
}

export function shouldShowChatMessageTimestamp(
  prevMsg: ChatUiMessage | undefined,
  msg: ChatUiMessage,
): boolean {
  if (!prevMsg) return true;
  const currentTs = messageTimestampMs(msg.id);
  const previousTs = messageTimestampMs(prevMsg.id);
  if (currentTs == null || previousTs == null) {
    return msg.from !== prevMsg.from;
  }
  return currentTs - previousTs >= TIMESTAMP_GAP_MS;
}
