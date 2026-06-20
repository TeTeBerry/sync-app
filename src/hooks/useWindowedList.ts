import { useCallback, useEffect, useMemo, useState } from 'react';

export type UseWindowedListOptions = {
  initialSize?: number;
  step?: number;
  maxVisible?: number;
  slidingWindow?: boolean;
  slideBuffer?: number;
};

export function computeListWindow(
  slidingWindow: boolean,
  focalIndex: number,
  loadedEnd: number,
  maxVisible: number,
  slideBuffer: number,
): { windowStart: number; windowEnd: number } {
  if (!slidingWindow) {
    return { windowStart: 0, windowEnd: loadedEnd };
  }
  const half = Math.floor(maxVisible / 2);
  const idealStart = Math.max(0, focalIndex - Math.max(slideBuffer, half));
  let start = Math.min(idealStart, Math.max(0, loadedEnd - maxVisible));
  const end = Math.min(loadedEnd, start + maxVisible);
  if (end - start < maxVisible && start > 0) {
    start = Math.max(0, end - maxVisible);
  }
  return { windowStart: start, windowEnd: end };
}

/**
 * Renders a bounded slice of items; grow with `showMore` or `ensureIndexVisible`.
 * Optional sliding window unmounts off-screen cards (WeChat mini program setData).
 */
export function useWindowedList<T>(
  items: T[],
  {
    initialSize = 8,
    step = 8,
    maxVisible = 12,
    slidingWindow = false,
    slideBuffer = 3,
  }: UseWindowedListOptions = {},
) {
  const [endLimit, setEndLimit] = useState(() =>
    Math.min(initialSize, Math.max(items.length, 0)),
  );
  const [focalIndex, setFocalIndex] = useState(0);

  useEffect(() => {
    if (items.length === 0) {
      setEndLimit(initialSize);
      setFocalIndex(0);
      return;
    }
    setEndLimit((prev) => Math.min(Math.max(prev, initialSize), items.length));
    setFocalIndex((prev) => Math.min(prev, items.length - 1));
  }, [items.length, initialSize]);

  const loadedEnd = Math.min(endLimit, items.length);

  const { windowStart, windowEnd } = useMemo(
    () =>
      computeListWindow(slidingWindow, focalIndex, loadedEnd, maxVisible, slideBuffer),
    [slidingWindow, focalIndex, loadedEnd, maxVisible, slideBuffer],
  );

  const visibleItems = useMemo(
    () => items.slice(windowStart, windowEnd),
    [items, windowStart, windowEnd],
  );

  const hiddenCount = Math.max(0, items.length - visibleItems.length);
  const hasMoreToShow = loadedEnd < items.length || hiddenCount > 0;

  const showMore = useCallback(() => {
    setEndLimit((prev) => {
      const next = Math.min(prev + step, items.length);
      if (slidingWindow) {
        return next;
      }
      return Math.min(next, maxVisible);
    });
  }, [items.length, step, slidingWindow, maxVisible]);

  const ensureIndexVisible = useCallback(
    (index: number) => {
      if (index < 0) return;
      setFocalIndex(index);
      setEndLimit((prev) => Math.max(prev, Math.min(index + 1, items.length)));
    },
    [items.length],
  );

  const setScrollFocalIndex = useCallback(
    (index: number) => {
      if (index < 0 || index >= items.length) return;
      setFocalIndex(index);
    },
    [items.length],
  );

  const showAll = useCallback(() => {
    setEndLimit(items.length);
  }, [items.length]);

  const resetWindow = useCallback(() => {
    setEndLimit(Math.min(initialSize, items.length));
    setFocalIndex(0);
  }, [initialSize, items.length]);

  return {
    visibleItems,
    windowStart,
    windowEnd,
    focalIndex,
    hiddenCount,
    hasMoreToShow,
    showMore,
    showAll,
    ensureIndexVisible,
    setScrollFocalIndex,
    resetWindow,
  };
}
