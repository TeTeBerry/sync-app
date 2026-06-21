import { useCallback, useRef } from 'react';
import { useIsOverlayLocked } from '../../hooks/useOverlayLock';
import { ScrollView, type ScrollViewProps } from '@tarojs/components';

type OverlayAwareScrollViewProps = ScrollViewProps & {
  scrollY?: boolean;
  /** Pin scroll offset while a parent sheet is open (before overlay lock). */
  pinScroll?: boolean;
};

/** Disables page scroll and pins offset while a sheet/dialog holds the overlay lock. */
export function OverlayAwareScrollView({
  scrollY = true,
  scrollTop: controlledScrollTop,
  scrollWithAnimation,
  pinScroll = false,
  onScroll,
  ...rest
}: OverlayAwareScrollViewProps) {
  const overlayLocked = useIsOverlayLocked();
  const scrollLocked = overlayLocked || pinScroll;
  const liveScrollRef = useRef(0);
  const pinnedScrollRef = useRef<number | null>(null);
  const prevLockedRef = useRef(false);

  if (scrollLocked && !prevLockedRef.current) {
    pinnedScrollRef.current =
      liveScrollRef.current ||
      (typeof controlledScrollTop === 'number' ? controlledScrollTop : 0);
  } else if (!scrollLocked && prevLockedRef.current) {
    pinnedScrollRef.current = null;
  }
  prevLockedRef.current = scrollLocked;

  const handleScroll = useCallback(
    (event: Parameters<NonNullable<ScrollViewProps['onScroll']>>[0]) => {
      liveScrollRef.current = event.detail.scrollTop;
      onScroll?.(event);
    },
    [onScroll],
  );

  const resolvedScrollTop =
    scrollLocked && pinnedScrollRef.current != null
      ? pinnedScrollRef.current
      : controlledScrollTop;

  return (
    <ScrollView
      {...rest}
      scrollY={scrollY && !scrollLocked}
      scrollTop={resolvedScrollTop}
      scrollWithAnimation={scrollLocked ? false : scrollWithAnimation}
      onScroll={handleScroll}
    />
  );
}
