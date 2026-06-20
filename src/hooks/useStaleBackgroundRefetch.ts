import { useRef } from 'react';
import { useDidShow } from '@tarojs/taro';
import { getCacheTimestamp } from './useApiQuery';

type RefetchFn = (options?: {
  force?: boolean;
  background?: boolean;
}) => Promise<unknown>;

type UseStaleBackgroundRefetchOptions = {
  refetch: RefetchFn;
  queryKey: (string | number | undefined)[];
  staleTime: number;
  minIntervalMs?: number;
  enabled?: boolean;
};

export function shouldStaleBackgroundRefetch(
  now: number,
  cacheTimestamp: number,
  lastDidShowRefetch: number,
  staleTime: number,
  minIntervalMs: number,
): boolean {
  if (now - lastDidShowRefetch < minIntervalMs) return false;
  if (now - cacheTimestamp < staleTime) return false;
  return true;
}

/**
 * Tab `useDidShow` refetch — only when cache is stale and min interval elapsed.
 */
export function useStaleBackgroundRefetch({
  refetch,
  queryKey,
  staleTime,
  minIntervalMs = 30_000,
  enabled = true,
}: UseStaleBackgroundRefetchOptions): void {
  const lastDidShowRefetchRef = useRef(0);

  useDidShow(() => {
    if (!enabled) return;

    const now = Date.now();
    const cacheTimestamp = getCacheTimestamp(queryKey) ?? 0;
    if (
      !shouldStaleBackgroundRefetch(
        now,
        cacheTimestamp,
        lastDidShowRefetchRef.current,
        staleTime,
        minIntervalMs,
      )
    ) {
      return;
    }

    lastDidShowRefetchRef.current = now;
    void refetch({ background: true });
  });
}
