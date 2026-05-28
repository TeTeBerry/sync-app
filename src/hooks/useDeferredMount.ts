import { useEffect, useState } from "react";

/**
 * Defers below-the-fold work until after first paint.
 */
export function useDeferredMount(timeoutMs = 120): boolean {
  const [ready, setReady] = useState(false);

  useEffect(() => {
    const timer = setTimeout(() => setReady(true), timeoutMs);
    return () => clearTimeout(timer);
  }, [timeoutMs]);

  return ready;
}
