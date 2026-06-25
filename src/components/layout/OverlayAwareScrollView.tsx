import { useCallback, useEffect, useLayoutEffect, useRef, useState } from 'react';
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
  const pendingRestoreRef = useRef<number | null>(null);
  const prevLockedRef = useRef(false);
  const [restoreScrollTop, setRestoreScrollTop] = useState<number | undefined>();

  const enteringLock = scrollLocked && !prevLockedRef.current;
  const leavingLock = !scrollLocked && prevLockedRef.current;

  if (enteringLock) {
    pinnedScrollRef.current =
      liveScrollRef.current ||
      (restoreScrollTop ??
        (typeof controlledScrollTop === 'number' ? controlledScrollTop : 0));
  }

  if (leavingLock && pinnedScrollRef.current != null) {
    const preserved = pinnedScrollRef.current;
    pinnedScrollRef.current = null;
    if (preserved > 0 && controlledScrollTop === undefined) {
      pendingRestoreRef.current = preserved;
    }
  }

  prevLockedRef.current = scrollLocked;

  useLayoutEffect(() => {
    const top = pendingRestoreRef.current;
    if (top == null) {
      return;
    }
    pendingRestoreRef.current = null;
    setRestoreScrollTop(top);
  }, [scrollLocked]);

  useEffect(() => {
    if (typeof controlledScrollTop === 'number') {
      setRestoreScrollTop(undefined);
    }
  }, [controlledScrollTop]);

  const handleScroll = useCallback(
    (event: Parameters<NonNullable<ScrollViewProps['onScroll']>>[0]) => {
      liveScrollRef.current = event.detail.scrollTop;
      if (restoreScrollTop != null && !scrollLocked) {
        setRestoreScrollTop(undefined);
      }
      onScroll?.(event);
    },
    [onScroll, restoreScrollTop, scrollLocked],
  );

  const resolvedScrollTop = scrollLocked
    ? (pinnedScrollRef.current ?? liveScrollRef.current)
    : (controlledScrollTop ?? restoreScrollTop);

  const scrollTopProps =
    typeof resolvedScrollTop === 'number' ? { scrollTop: resolvedScrollTop } : {};

  return (
    <ScrollView
      {...rest}
      {...scrollTopProps}
      scrollY={scrollY && !scrollLocked}
      scrollWithAnimation={scrollLocked ? false : scrollWithAnimation}
      onScroll={handleScroll}
    />
  );
}
