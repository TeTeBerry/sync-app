import { useCallback, useEffect, useMemo, useState } from 'react';
import type { ChatUiMessage } from '../../types/aiChat';

const DEFAULT_WINDOW_SIZE = 30;
const WINDOW_STEP = 20;

export function useChatMessageWindow(
  messages: ChatUiMessage[],
  options?: { initialSize?: number; step?: number },
) {
  const initialSize = options?.initialSize ?? DEFAULT_WINDOW_SIZE;
  const step = options?.step ?? WINDOW_STEP;
  const [windowSize, setWindowSize] = useState(() =>
    Math.min(initialSize, Math.max(messages.length, 0)),
  );

  useEffect(() => {
    setWindowSize((prev) => {
      if (messages.length < prev) {
        return Math.min(initialSize, messages.length);
      }
      return prev;
    });
  }, [initialSize, messages.length]);

  const visibleMessages = useMemo(() => {
    if (messages.length <= windowSize) {
      return messages;
    }
    return messages.slice(messages.length - windowSize);
  }, [messages, windowSize]);

  const hiddenCount = Math.max(0, messages.length - visibleMessages.length);
  const hasHiddenMessages = hiddenCount > 0;

  const expandWindow = useCallback(() => {
    setWindowSize((prev) => Math.min(prev + step, messages.length));
  }, [messages.length, step]);

  const expandWindowBy = useCallback(
    (count: number) => {
      if (count <= 0) return;
      setWindowSize((prev) => Math.min(prev + count, messages.length));
    },
    [messages.length],
  );

  const ensureFullyVisible = useCallback(() => {
    setWindowSize(messages.length);
  }, [messages.length]);

  return {
    visibleMessages,
    hiddenCount,
    hasHiddenMessages,
    expandWindow,
    expandWindowBy,
    ensureFullyVisible,
  };
}
