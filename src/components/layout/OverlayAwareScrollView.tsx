import { useCallback, useRef } from 'react';
import { useIsOverlayLocked } from '../../hooks/useOverlayLock';
import { ScrollView, type ScrollViewProps } from '@tarojs/components';

type OverlayAwareScrollViewProps = ScrollViewProps & {
  scrollY?: boolean;
};

/** Disables page scroll and pins offset while a sheet/dialog holds the overlay lock. */
export function OverlayAwareScrollView({
  scrollY = true,
  scrollTop: controlledScrollTop,
  scrollWithAnimation,
  onScroll,
  ...rest
}: OverlayAwareScrollViewProps) {
  const overlayLocked = useIsOverlayLocked();
  const liveScrollRef = useRef(0);
  const pinnedScrollRef = useRef<number | null>(null);
  const prevLockedRef = useRef(false);

  if (overlayLocked && !prevLockedRef.current) {
    pinnedScrollRef.current = liveScrollRef.current;
  } else if (!overlayLocked && prevLockedRef.current) {
    pinnedScrollRef.current = null;
  }
  prevLockedRef.current = overlayLocked;

  const handleScroll = useCallback(
    (event: Parameters<NonNullable<ScrollViewProps['onScroll']>>[0]) => {
      liveScrollRef.current = event.detail.scrollTop;
      onScroll?.(event);
    },
    [onScroll],
  );

  const resolvedScrollTop =
    overlayLocked && pinnedScrollRef.current != null
      ? pinnedScrollRef.current
      : controlledScrollTop;

  return (
    <ScrollView
      {...rest}
      scrollY={scrollY && !overlayLocked}
      scrollTop={resolvedScrollTop}
      scrollWithAnimation={overlayLocked ? false : scrollWithAnimation}
      onScroll={handleScroll}
    />
  );
}
