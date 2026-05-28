import { useEffect, useState } from "react";
import { DEFER_BELOW_FOLD_MS } from "../utils/timing";

/**
 * Defers below-the-fold work until after first paint.
 */
export function useDeferredMount(timeoutMs = DEFER_BELOW_FOLD_MS): boolean {
  const [ready, setReady] = useState(false);

  useEffect(() => {
    const timer = setTimeout(() => setReady(true), timeoutMs);
    return () => clearTimeout(timer);
  }, [timeoutMs]);

  return ready;
}
