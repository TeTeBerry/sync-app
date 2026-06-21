import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { throttleRaf } from '../../utils/throttleRaf';

const SCROLL_TOP_STEP = 100_000;
const NEAR_BOTTOM_THRESHOLD_PX = 80;
const LAYOUT_RETRY_MS = 120;

export type ChatScrollController = {
  scrollTop: number;
  scrollIntoView?: string;
  scrollToBottom: (options?: { force?: boolean }) => void;
  scrollToTop: () => void;
  handleScroll: (detail: {
    scrollTop: number;
    scrollHeight: number;
    clientHeight?: number;
  }) => void;
  isNearBottom: () => boolean;
};

export function useChatScrollController(options: {
  messageCount: number;
  bottomAnchorId: string;
  forceScrollToBottomKey?: number;
  suppressAutoScroll?: boolean;
  /** Stream length, keyboard inset, etc. — triggers throttled auto-scroll when changed. */
  contentRevision?: string;
}): ChatScrollController {
  const {
    messageCount,
    bottomAnchorId,
    forceScrollToBottomKey = 0,
    suppressAutoScroll = false,
    contentRevision = '',
  } = options;

  const scrollTopRef = useRef(0);
  const nearBottomRef = useRef(true);
  const retryTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const [scrollTop, setScrollTop] = useState(0);
  const [scrollIntoView, setScrollIntoView] = useState<string | undefined>();

  const applyScrollIntoView = useCallback(() => {
    setScrollIntoView(undefined);
    setScrollIntoView(bottomAnchorId);
  }, [bottomAnchorId]);

  const scrollToTop = useCallback(() => {
    nearBottomRef.current = false;
    scrollTopRef.current = 0;
    setScrollTop(0);
    setScrollIntoView(undefined);
  }, []);

  const scrollToBottom = useCallback(
    (scrollOptions?: { force?: boolean }) => {
      if (messageCount === 0) return;
      if (!scrollOptions?.force && suppressAutoScroll) return;
      if (!scrollOptions?.force && !nearBottomRef.current) return;

      scrollTopRef.current =
        scrollTopRef.current >= 5_000_000
          ? SCROLL_TOP_STEP
          : scrollTopRef.current + SCROLL_TOP_STEP;
      setScrollTop(scrollTopRef.current);
      applyScrollIntoView();

      if (retryTimerRef.current) {
        clearTimeout(retryTimerRef.current);
      }
      retryTimerRef.current = setTimeout(() => {
        applyScrollIntoView();
        retryTimerRef.current = null;
      }, LAYOUT_RETRY_MS);
    },
    [applyScrollIntoView, messageCount, suppressAutoScroll],
  );

  const scrollToBottomThrottled = useMemo(
    () => throttleRaf(() => scrollToBottom()),
    [scrollToBottom],
  );

  const handleScroll = useCallback(
    (detail: { scrollTop: number; scrollHeight: number; clientHeight?: number }) => {
      const clientHeight = detail.clientHeight ?? 0;
      const distanceFromBottom = detail.scrollHeight - detail.scrollTop - clientHeight;
      nearBottomRef.current = distanceFromBottom <= NEAR_BOTTOM_THRESHOLD_PX;
    },
    [],
  );

  useEffect(() => {
    return () => {
      if (retryTimerRef.current) {
        clearTimeout(retryTimerRef.current);
      }
    };
  }, []);

  useEffect(() => {
    if (suppressAutoScroll) return;
    scrollToBottomThrottled();
  }, [contentRevision, messageCount, suppressAutoScroll, scrollToBottomThrottled]);

  useEffect(() => {
    if (!forceScrollToBottomKey) return;
    if (suppressAutoScroll) return;
    nearBottomRef.current = true;
    scrollToBottom({ force: true });
  }, [forceScrollToBottomKey, scrollToBottom, suppressAutoScroll]);

  return {
    scrollTop,
    scrollIntoView,
    scrollToBottom,
    scrollToTop,
    handleScroll,
    isNearBottom: () => nearBottomRef.current,
  };
}
