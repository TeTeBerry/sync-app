import { useEffect, useState } from 'react';

/**
 * Defers below-the-fold work until after first paint.
 */
export function useDeferredMount(timeoutMs = 0): boolean {
  const [ready, setReady] = useState(timeoutMs <= 0);

  useEffect(() => {
    if (timeoutMs <= 0) {
      setReady(true);
      return;
    }

    let cancelled = false;
    let timer: ReturnType<typeof setTimeout> | undefined;
    const raf =
      typeof requestAnimationFrame === 'function'
        ? requestAnimationFrame(() => {
            timer = setTimeout(() => {
              if (!cancelled) setReady(true);
            }, timeoutMs);
          })
        : undefined;
    if (raf == null) {
      timer = setTimeout(() => {
        if (!cancelled) setReady(true);
      }, timeoutMs);
    }
    return () => {
      cancelled = true;
      if (raf != null && typeof cancelAnimationFrame === 'function') {
        cancelAnimationFrame(raf);
      }
      if (timer != null) clearTimeout(timer);
    };
  }, [timeoutMs]);

  return ready;
}
