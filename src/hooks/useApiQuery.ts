import { useState, useEffect, useCallback, useRef } from "react";

interface CacheEntry<T> {
  data: T;
  timestamp: number;
}

const globalCache = new Map<string, CacheEntry<unknown>>();

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

  const fetch = useCallback(async () => {
    const now = Date.now();
    if (now - lastFetchRef.current < staleTime && data !== undefined) {
      return;
    }

    setIsLoading(true);
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
      setIsLoading(false);
    }
  }, [queryFn, staleTime, cacheKey, data]);

  useEffect(() => {
    if (enabled) {
      void fetch();
    }
  }, [enabled, fetch]);

  return {
    data,
    isLoading,
    isError,
    error,
    refetch: fetch,
  };
}
