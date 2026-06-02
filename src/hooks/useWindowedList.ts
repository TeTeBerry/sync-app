import { useCallback, useEffect, useMemo, useState } from 'react';

export type UseWindowedListOptions = {
  initialSize?: number;
  step?: number;
};

/**
 * Renders only the first N items; grow with `showMore` or `ensureIndexVisible`.
 * Reduces setData cost on long lists (WeChat mini program).
 */
export function useWindowedList<T>(
  items: T[],
  { initialSize = 8, step = 8 }: UseWindowedListOptions = {},
) {
  const [limit, setLimit] = useState(() =>
    Math.min(initialSize, Math.max(items.length, 0)),
  );

  useEffect(() => {
    if (items.length === 0) {
      setLimit(initialSize);
      return;
    }
    setLimit((prev) => Math.min(Math.max(prev, initialSize), items.length));
  }, [items.length, initialSize]);

  const visibleItems = useMemo(
    () => items.slice(0, Math.min(limit, items.length)),
    [items, limit],
  );

  const hiddenCount = Math.max(0, items.length - visibleItems.length);
  const hasMoreToShow = hiddenCount > 0;

  const showMore = useCallback(() => {
    setLimit((prev) => Math.min(prev + step, items.length));
  }, [items.length, step]);

  const ensureIndexVisible = useCallback(
    (index: number) => {
      if (index < 0) return;
      setLimit((prev) => Math.max(prev, Math.min(index + 1, items.length)));
    },
    [items.length],
  );

  const showAll = useCallback(() => {
    setLimit(items.length);
  }, [items.length]);

  return {
    visibleItems,
    hiddenCount,
    hasMoreToShow,
    showMore,
    showAll,
    ensureIndexVisible,
  };
}
