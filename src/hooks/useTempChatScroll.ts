import { useCallback, useEffect, useLayoutEffect, useRef, useState } from 'react';
import type { TempChatMessage } from '../types/tempChat';

const SCROLL_TOP_STEP = 100_000;
const NEAR_BOTTOM_PX = 80;
export const TEMP_CHAT_SCROLL_BOTTOM_ID = 'temp-chat-scroll-bottom';

type ScrollEventDetail = {
  scrollTop?: number;
};

/**
 * Stick-to-bottom tracking + programmatic scroll without fighting user history reads.
 */
export function useTempChatScroll(messages: TempChatMessage[], sessionId: string) {
  const [scrollIntoView, setScrollIntoView] = useState<string | undefined>();
  const [scrollTop, setScrollTop] = useState(0);
  const scrollTopRef = useRef(0);
  const stickToBottomRef = useRef(true);
  const maxScrollTopRef = useRef(0);
  const prevCountRef = useRef(0);

  useEffect(() => {
    stickToBottomRef.current = true;
    maxScrollTopRef.current = 0;
    prevCountRef.current = 0;
    scrollTopRef.current = 0;
    setScrollTop(0);
    setScrollIntoView(undefined);
  }, [sessionId]);

  const scrollToBottom = useCallback(() => {
    if (messages.length === 0) return;
    scrollTopRef.current =
      scrollTopRef.current >= 5_000_000
        ? SCROLL_TOP_STEP
        : scrollTopRef.current + SCROLL_TOP_STEP;
    setScrollTop(scrollTopRef.current);
    setScrollIntoView(undefined);
    const apply = () => setScrollIntoView(TEMP_CHAT_SCROLL_BOTTOM_ID);
    setTimeout(apply, 0);
    setTimeout(apply, 80);
  }, [messages.length]);

  const onScroll = useCallback((detail: ScrollEventDetail) => {
    const top = detail.scrollTop ?? 0;
    maxScrollTopRef.current = Math.max(maxScrollTopRef.current, top);
    const distanceFromBottom = maxScrollTopRef.current - top;
    stickToBottomRef.current = distanceFromBottom <= NEAR_BOTTOM_PX;
  }, []);

  useLayoutEffect(() => {
    const prevCount = prevCountRef.current;
    const count = messages.length;
    prevCountRef.current = count;
    if (count === 0) return;

    const last = messages[count - 1];
    const grew = count > prevCount;
    if (!grew && prevCount > 0) return;

    const shouldScroll =
      prevCount === 0 || stickToBottomRef.current || last?.role === 'me';
    if (!shouldScroll) return;

    stickToBottomRef.current = true;
    scrollToBottom();
  }, [messages, scrollToBottom]);

  const markStickToBottom = useCallback(() => {
    stickToBottomRef.current = true;
    scrollToBottom();
  }, [scrollToBottom]);

  return {
    scrollIntoView,
    scrollTop,
    onScroll,
    markStickToBottom,
  };
}
