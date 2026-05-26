import { useEffect, useState } from "react";

/**
 * Defers below-the-fold work until after first paint (idle callback or short timeout).
 */
export function useDeferredMount(timeoutMs = 120): boolean {
  const [ready, setReady] = useState(false);

  useEffect(() => {
    if (typeof window === "undefined") {
      setReady(true);
      return;
    }

    const win = window as Window & {
      requestIdleCallback?: (
        cb: IdleRequestCallback,
        opts?: IdleRequestOptions,
      ) => number;
      cancelIdleCallback?: (id: number) => void;
    };

    if (typeof win.requestIdleCallback === "function") {
      const id = win.requestIdleCallback(() => setReady(true), { timeout: timeoutMs });
      return () => win.cancelIdleCallback?.(id);
    }

    const timer = window.setTimeout(() => setReady(true), timeoutMs);
    return () => window.clearTimeout(timer);
  }, [timeoutMs]);

  return ready;
}
