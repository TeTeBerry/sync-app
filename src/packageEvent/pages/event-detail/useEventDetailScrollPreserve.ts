import { useCallback, useRef } from 'react';

/** Tracks scroll position; `scrollFrozen` reserved for apply-team pin (currently unused). */
export function useEventDetailScrollPreserve() {
  const liveScrollRef = useRef(0);

  const handleScroll = useCallback((scrollTop: number) => {
    liveScrollRef.current = scrollTop;
  }, []);

  return {
    handleScroll,
    frozenTop: null as number | null,
    scrollFrozen: false,
  };
}
