import { useState, useEffect, useCallback, useRef } from "react";

interface CacheEntry<T> {
  data: T;
  timestamp: number;
}

const globalCache = new Map<string, CacheEntry<unknown>>();

type InvalidationListener = (prefix: string) => void;
const invalidationListeners = new Set<InvalidationListener>();
const cacheDataListeners = new Set<InvalidationListener>();

function subscribeInvalidation(listener: InvalidationListener) {
  invalidationListeners.add(listener);
  return () => {
    invalidationListeners.delete(listener);
  };
}

function subscribeCacheData(listener: InvalidationListener) {
  cacheDataListeners.add(listener);
  return () => {
    cacheDataListeners.delete(listener);
  };
}

/** Sync mounted queries from globalCache after an in-place patch (no refetch). */
export function broadcastCacheData(queryKey: (string | number | undefined)[]) {
  const prefix = getCacheKey(queryKey);
  for (const listener of cacheDataListeners) {
    listener(prefix);
  }
}

export function getCacheKey(queryKey: (string | number | undefined)[]) {
  return queryKey.map(String).join("|");
}

export function invalidateCache(queryKey: (string | number | undefined)[]) {
  const prefix = getCacheKey(queryKey);
  for (const key of globalCache.keys()) {
    if (key.startsWith(prefix)) {
      globalCache.delete(key);
    }
  }
  for (const listener of invalidationListeners) {
    listener(prefix);
  }
}

export function setCacheData<T>(
  queryKey: (string | number | undefined)[],
  updater: (prev: T | undefined) => T | undefined,
) {
  const key = getCacheKey(queryKey);
  const existing = globalCache.get(key) as CacheEntry<T> | undefined;
  const newData = updater(existing?.data);
  if (newData !== undefined) {
    globalCache.set(key, { data: newData, timestamp: Date.now() });
  }
}

export function getCacheData<T>(
  queryKey: (string | number | undefined)[],
): T | undefined {
  const key = getCacheKey(queryKey);
  return (globalCache.get(key) as CacheEntry<T> | undefined)?.data;
}

/** Iterate all cached query entries (for cross-key optimistic patches). */
export function forEachCacheEntry(
  fn: (cacheKey: string, data: unknown) => void,
): void {
  for (const [key, entry] of globalCache.entries()) {
    fn(key, entry.data);
  }
}

export function setCacheDataByKey<T>(cacheKey: string, data: T): void {
  globalCache.set(cacheKey, { data, timestamp: Date.now() });
}

interface UseApiQueryOptions<T> {
  queryKey: (string | number | undefined)[];
  queryFn: () => Promise<T>;
  enabled?: boolean;
  staleTime?: number;
}

export function useApiQuery<T>(options: UseApiQueryOptions<T>) {
  const { queryKey, queryFn, enabled = true, staleTime = 0 } = options;
  const cacheKey = getCacheKey(queryKey);
  const cached = globalCache.get(cacheKey) as CacheEntry<T> | undefined;

  const [data, setData] = useState<T | undefined>(cached?.data);
  const [isLoading, setIsLoading] = useState(false);
  const [isError, setIsError] = useState(false);
  const [error, setError] = useState<Error | null>(null);
  const lastFetchRef = useRef<number>(cached?.timestamp ?? 0);

  const fetch = useCallback(
    async (options?: { force?: boolean; background?: boolean }) => {
      const force = options?.force ?? false;
      const background = options?.background ?? false;
      const now = Date.now();
      if (!force && now - lastFetchRef.current < staleTime && data !== undefined) {
        return;
      }

      if (!background) {
        setIsLoading(true);
      }
      setIsError(false);
      setError(null);
      try {
        const result = await queryFn();
        setData(result);
        globalCache.set(cacheKey, { data: result, timestamp: now });
        lastFetchRef.current = now;
      } catch (err) {
        setIsError(true);
        setError(err instanceof Error ? err : new Error(String(err)));
      } finally {
        if (!background) {
          setIsLoading(false);
        }
      }
    },
    [queryFn, staleTime, cacheKey, data],
  );

  useEffect(() => {
    if (enabled) {
      void fetch();
    }
  }, [enabled, fetch]);

  useEffect(() => {
    if (!enabled) return;
    return subscribeInvalidation((prefix) => {
      if (!cacheKey.startsWith(prefix)) return;
      lastFetchRef.current = 0;
      void fetch({ force: true, background: data !== undefined });
    });
  }, [cacheKey, enabled, fetch, data]);

  useEffect(() => {
    if (!enabled) return;
    return subscribeCacheData((prefix) => {
      if (!cacheKey.startsWith(prefix)) return;
      const entry = globalCache.get(cacheKey) as CacheEntry<T> | undefined;
      if (entry) {
        setData(entry.data);
        lastFetchRef.current = entry.timestamp;
      }
    });
  }, [cacheKey, enabled]);

  return {
    data,
    isLoading,
    isError,
    error,
    refetch: () => fetch({ force: true }),
  };
}
