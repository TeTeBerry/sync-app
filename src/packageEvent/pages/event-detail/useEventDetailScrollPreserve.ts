import { useCallback, useRef, useState } from 'react';

/** Pin ScrollView offset during apply-team flow (no animated/programmatic scroll). */
export function useEventDetailScrollPreserve() {
  const liveScrollRef = useRef(0);
  const [frozenTop, setFrozenTop] = useState<number | null>(null);
  const scrollFrozen = frozenTop != null;

  const handleScroll = useCallback((scrollTop: number) => {
    liveScrollRef.current = scrollTop;
  }, []);

  const freezeScroll = useCallback(() => {
    setFrozenTop(liveScrollRef.current);
  }, []);

  const unfreezeScroll = useCallback(() => {
    setFrozenTop(null);
  }, []);

  return {
    handleScroll,
    frozenTop,
    scrollFrozen,
    freezeScroll,
    unfreezeScroll,
  };
}
