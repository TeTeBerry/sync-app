import { useState, useEffect, useCallback, useRef } from 'react';

interface CacheEntry<T> {
  data: T;
  timestamp: number;
}

const globalCache = new Map<string, CacheEntry<unknown>>();
/** One in-flight request per cache key (shared across hook instances). */
const inflightByKey = new Map<string, Promise<unknown>>();

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

/** Subscribe while mounted — refetch when `invalidateCache` matches this key prefix. */
export function onCacheInvalidated(cacheKey: string, listener: () => void): () => void {
  return subscribeInvalidation((prefix) => {
    if (cacheKey.startsWith(prefix)) {
      listener();
    }
  });
}

/** Subscribe while mounted — resync when `broadcastCacheData` matches this key prefix. */
export function onCacheDataUpdated(cacheKey: string, listener: () => void): () => void {
  return subscribeCacheData((prefix) => {
    if (cacheKey.startsWith(prefix)) {
      listener();
    }
  });
}

/** Sync mounted queries from globalCache after an in-place patch (no refetch). */
export function broadcastCacheData(queryKey: (string | number | undefined)[]) {
  const prefix = getCacheKey(queryKey);
  for (const listener of cacheDataListeners) {
    listener(prefix);
  }
}

export function getCacheKey(queryKey: (string | number | undefined)[]) {
  return queryKey.map(String).join('|');
}

export function invalidateCache(queryKey: (string | number | undefined)[]) {
  const prefix = getCacheKey(queryKey);
  for (const key of globalCache.keys()) {
    if (key.startsWith(prefix)) {
      globalCache.delete(key);
    }
  }
  for (const key of inflightByKey.keys()) {
    if (key.startsWith(prefix)) {
      inflightByKey.delete(key);
    }
  }
  for (const listener of invalidationListeners) {
    listener(prefix);
  }
}

/** Wipe all in-memory query cache (e.g. local data reset for new-user testing). */
export function clearAllApiCache(): void {
  globalCache.clear();
  inflightByKey.clear();
  for (const listener of invalidationListeners) {
    listener('');
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

export function getCacheTimestamp(
  queryKey: (string | number | undefined)[],
): number | undefined {
  const key = getCacheKey(queryKey);
  return (globalCache.get(key) as CacheEntry<unknown> | undefined)?.timestamp;
}

/** Iterate all cached query entries (for cross-key optimistic patches). */
export function forEachCacheEntry(fn: (cacheKey: string, data: unknown) => void): void {
  for (const [key, entry] of globalCache.entries()) {
    fn(key, entry.data);
  }
}

export function setCacheDataByKey<T>(
  cacheKey: string,
  data: T,
  timestamp?: number,
): void {
  globalCache.set(cacheKey, { data, timestamp: timestamp ?? Date.now() });
}

/** Shared in-flight dedupe for app-launch prefetch and mounted hooks. */
export async function prefetchToCache<T>(
  queryKey: (string | number | undefined)[],
  queryFn: () => Promise<T>,
): Promise<T | undefined> {
  const cacheKey = getCacheKey(queryKey);
  const cached = globalCache.get(cacheKey) as CacheEntry<T> | undefined;
  if (cached) {
    return cached.data;
  }

  let request = inflightByKey.get(cacheKey) as Promise<T> | undefined;
  if (!request) {
    request = queryFn()
      .then((result) => {
        globalCache.set(cacheKey, { data: result, timestamp: Date.now() });
        broadcastCacheData(queryKey);
        return result;
      })
      .finally(() => {
        if (inflightByKey.get(cacheKey) === request) {
          inflightByKey.delete(cacheKey);
        }
      });
    inflightByKey.set(cacheKey, request);
  }

  try {
    return await request;
  } catch {
    return undefined;
  }
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
  const [isLoading, setIsLoading] = useState(
    () => enabled && cached?.data === undefined,
  );
  const [isError, setIsError] = useState(false);
  const [error, setError] = useState<Error | null>(null);
  const lastFetchRef = useRef<number>(cached?.timestamp ?? 0);
  const queryFnRef = useRef(queryFn);
  queryFnRef.current = queryFn;
  const dataRef = useRef(data);
  dataRef.current = data;

  const fetch = useCallback(
    async (options?: {
      force?: boolean;
      background?: boolean;
    }): Promise<T | undefined> => {
      const force = options?.force ?? false;
      const background = options?.background ?? false;
      const now = Date.now();

      if (!force) {
        const cachedEntry = globalCache.get(cacheKey) as CacheEntry<T> | undefined;
        if (cachedEntry && now - cachedEntry.timestamp < staleTime) {
          setData(cachedEntry.data);
          lastFetchRef.current = cachedEntry.timestamp;
          return cachedEntry.data;
        }
        if (now - lastFetchRef.current < staleTime && dataRef.current !== undefined) {
          return dataRef.current;
        }
      }

      const runFetch = async (): Promise<T> => {
        const result = await queryFnRef.current();
        const timestamp = Date.now();
        globalCache.set(cacheKey, { data: result, timestamp });
        broadcastCacheData(queryKey);
        return result;
      };

      let request = inflightByKey.get(cacheKey) as Promise<T> | undefined;
      if (!request) {
        request = runFetch().finally(() => {
          if (inflightByKey.get(cacheKey) === request) {
            inflightByKey.delete(cacheKey);
          }
        });
        inflightByKey.set(cacheKey, request);
      }

      if (!background) {
        setIsLoading(true);
      }
      setIsError(false);
      setError(null);
      try {
        const result = await request;
        setData(result);
        lastFetchRef.current = Date.now();
        return result;
      } catch (err) {
        setIsError(true);
        setError(err instanceof Error ? err : new Error(String(err)));
        return undefined;
      } finally {
        if (!background) {
          setIsLoading(false);
        }
      }
    },
    [staleTime, cacheKey],
  );

  useEffect(() => {
    const entry = globalCache.get(cacheKey) as CacheEntry<T> | undefined;
    setData(entry?.data);
    lastFetchRef.current = entry?.timestamp ?? 0;
    if (!enabled) {
      setIsLoading(false);
      return;
    }
    if (entry?.data === undefined) {
      setIsLoading(true);
    }
    void fetch({ background: entry?.data !== undefined });
  }, [cacheKey, enabled, fetch]);

  useEffect(() => {
    if (!enabled) return;
    return subscribeInvalidation((prefix) => {
      if (!cacheKey.startsWith(prefix)) return;
      lastFetchRef.current = 0;
      void fetch({ force: true, background: dataRef.current !== undefined });
    });
  }, [cacheKey, enabled, fetch]);

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

  const refetch = useCallback(
    (options?: { background?: boolean }) =>
      fetch({ force: true, background: options?.background ?? false }),
    [fetch],
  );

  return {
    data,
    isLoading,
    isError,
    error,
    refetch,
  };
}
