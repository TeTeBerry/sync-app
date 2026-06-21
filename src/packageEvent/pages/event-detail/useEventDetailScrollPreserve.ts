import { useCallback, useRef, useState } from 'react';

/** Tracks scroll position and pins the page while sheets open (edit / post). */
export function useEventDetailScrollPreserve() {
  const liveScrollRef = useRef(0);
  const [frozenTop, setFrozenTop] = useState<number | null>(null);

  const handleScroll = useCallback((scrollTop: number) => {
    liveScrollRef.current = scrollTop;
  }, []);

  const freezeScroll = useCallback(() => {
    setFrozenTop(liveScrollRef.current);
  }, []);

  const unfreezeScroll = useCallback(() => {
    setFrozenTop(null);
  }, []);

  const getLiveScrollTop = useCallback(() => liveScrollRef.current, []);

  return {
    handleScroll,
    freezeScroll,
    unfreezeScroll,
    getLiveScrollTop,
    frozenTop,
    scrollFrozen: frozenTop != null,
  };
}
