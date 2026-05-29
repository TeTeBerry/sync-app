import { useEffect, useState } from "react";
import { DEFER_BELOW_FOLD_MS } from "../utils/timing";

/**
 * Defers below-the-fold work until after first paint.
 */
export function useDeferredMount(timeoutMs = DEFER_BELOW_FOLD_MS): boolean {
  const [ready, setReady] = useState(false);

  useEffect(() => {
    let cancelled = false;
    let timer: ReturnType<typeof setTimeout> | undefined;
    const raf =
      typeof requestAnimationFrame === "function"
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
      if (raf != null && typeof cancelAnimationFrame === "function") {
        cancelAnimationFrame(raf);
      }
      if (timer != null) clearTimeout(timer);
    };
  }, [timeoutMs]);

  return ready;
}
