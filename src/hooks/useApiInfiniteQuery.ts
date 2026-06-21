import { useCallback, useEffect, useRef, useState } from 'react';
import { ApiError } from '../utils/apiClient';
import {
  broadcastCacheData,
  getCacheData,
  getCacheKey,
  getCacheTimestamp,
  onCacheDataUpdated,
  onCacheInvalidated,
  prefetchToCache,
  setCacheData,
} from './useApiQuery';

export type InfiniteQueryPage<TItem> = {
  items: TItem[];
  nextCursor?: string;
  hasMore: boolean;
};

type Identifiable = { id: string };

type UseApiInfiniteQueryOptions<TItem> = {
  queryKey: (string | number | undefined)[];
  queryFn: (params: { cursor?: string }) => Promise<InfiniteQueryPage<TItem>>;
  enabled?: boolean;
  staleTime?: number;
  /** Skip global cache (e.g. anchor deep-link lists). */
  ephemeral?: boolean;
  /** Silent refresh merges server page with existing items. */
  mergeOnRefresh?: (incoming: TItem[], previous: TItem[]) => TItem[];
  /** loadMore appends the next page. */
  appendPage?: (incoming: TItem[], previous: TItem[]) => TItem[];
};

export function useApiInfiniteQuery<TItem extends Identifiable>(
  options: UseApiInfiniteQueryOptions<TItem>,
) {
  const {
    queryKey,
    queryFn,
    enabled = true,
    staleTime = 0,
    ephemeral = false,
    mergeOnRefresh,
    appendPage,
  } = options;

  const cacheKey = getCacheKey(queryKey);
  const readCache = useCallback((): InfiniteQueryPage<TItem> | undefined => {
    if (ephemeral) return undefined;
    return getCacheData<InfiniteQueryPage<TItem>>(queryKey);
  }, [ephemeral, queryKey]);

  const cached = readCache();

  const [items, setItems] = useState<TItem[]>(() => cached?.items ?? []);
  const [nextCursor, setNextCursor] = useState<string | undefined>(
    () => cached?.nextCursor,
  );
  const [hasMore, setHasMore] = useState(() => cached?.hasMore ?? false);
  const [isLoading, setIsLoading] = useState(
    () => enabled && !(cached?.items.length ?? 0),
  );
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [isLoadingMore, setIsLoadingMore] = useState(false);
  const [isError, setIsError] = useState(false);

  const loadingMoreRef = useRef(false);
  const lastFetchRef = useRef<number>(
    ephemeral ? 0 : (getCacheTimestamp(queryKey) ?? 0),
  );
  const queryFnRef = useRef(queryFn);
  queryFnRef.current = queryFn;
  const itemsRef = useRef(items);
  itemsRef.current = items;
  const skipSyncRef = useRef(false);

  const writeCache = useCallback(
    (page: InfiniteQueryPage<TItem>) => {
      if (ephemeral) return;
      skipSyncRef.current = true;
      setCacheData<InfiniteQueryPage<TItem>>(queryKey, () => page);
      broadcastCacheData(queryKey);
    },
    [ephemeral, queryKey],
  );

  const applyPage = useCallback(
    (page: InfiniteQueryPage<TItem>, mode: 'replace' | 'merge') => {
      setItems((previous) => {
        const nextItems =
          mode === 'merge' && mergeOnRefresh
            ? mergeOnRefresh(page.items, previous)
            : page.items;
        writeCache({
          items: nextItems,
          nextCursor: page.nextCursor,
          hasMore: page.hasMore,
        });
        return nextItems;
      });
      setNextCursor(page.nextCursor);
      setHasMore(page.hasMore);
    },
    [mergeOnRefresh, writeCache],
  );

  const syncFromCache = useCallback(() => {
    if (skipSyncRef.current) {
      skipSyncRef.current = false;
      return;
    }
    const entry = readCache();
    if (!entry) return;
    setItems(entry.items);
    setNextCursor(entry.nextCursor);
    setHasMore(entry.hasMore);
    lastFetchRef.current = getCacheTimestamp(queryKey) ?? lastFetchRef.current;
  }, [queryKey, readCache]);

  const fetchFirstPage = useCallback(async (): Promise<InfiniteQueryPage<TItem>> => {
    const request = () => queryFnRef.current({});
    if (ephemeral) {
      return request();
    }
    const cachedPage = await prefetchToCache(queryKey, request);
    return cachedPage ?? request();
  }, [ephemeral, queryKey]);

  const resetAndLoad = useCallback(
    async (options?: { silent?: boolean; force?: boolean }) => {
      if (!enabled) return;
      const silent = options?.silent === true;
      const force = options?.force === true;
      const now = Date.now();
      const hasCachedItems = (readCache()?.items.length ?? 0) > 0;

      if (
        !force &&
        !silent &&
        hasCachedItems &&
        now - lastFetchRef.current < staleTime
      ) {
        syncFromCache();
        setIsLoading(false);
        return;
      }

      if (silent) {
        setIsRefreshing(true);
      } else if (!hasCachedItems) {
        setIsLoading(true);
      }
      setIsError(false);
      try {
        const page = await fetchFirstPage();
        applyPage(page, silent && mergeOnRefresh ? 'merge' : 'replace');
        lastFetchRef.current = Date.now();
      } catch (error) {
        if (!silent) {
          const isUnauthorized =
            error instanceof ApiError && (error.status === 401 || error.status === 403);
          setIsError(true);
          if (!isUnauthorized) {
            setItems([]);
            setNextCursor(undefined);
            setHasMore(false);
            writeCache({ items: [], hasMore: false });
          }
        }
      } finally {
        if (silent) {
          setIsRefreshing(false);
        } else {
          setIsLoading(false);
        }
      }
    },
    [
      applyPage,
      enabled,
      fetchFirstPage,
      mergeOnRefresh,
      readCache,
      staleTime,
      syncFromCache,
      writeCache,
    ],
  );

  useEffect(() => {
    if (!enabled) {
      setItems([]);
      setNextCursor(undefined);
      setHasMore(false);
      setIsLoading(false);
      return;
    }
    syncFromCache();
    const hasCached = Boolean(readCache()?.items.length);
    setIsLoading(!hasCached);
    void resetAndLoad({ silent: hasCached });
  }, [cacheKey, enabled, readCache, resetAndLoad, syncFromCache]);

  useEffect(() => {
    if (!enabled) return;
    return onCacheInvalidated(cacheKey, () => {
      lastFetchRef.current = 0;
      void resetAndLoad({
        silent: itemsRef.current.length > 0,
        force: true,
      });
    });
  }, [cacheKey, enabled, resetAndLoad]);

  useEffect(() => {
    if (!enabled || ephemeral) return;
    return onCacheDataUpdated(cacheKey, syncFromCache);
  }, [cacheKey, enabled, ephemeral, syncFromCache]);

  const loadMore = useCallback(async () => {
    if (!enabled || !hasMore || !nextCursor || loadingMoreRef.current) {
      return;
    }
    loadingMoreRef.current = true;
    setIsLoadingMore(true);
    try {
      const page = await queryFnRef.current({ cursor: nextCursor });
      setItems((previous) => {
        const merged = appendPage
          ? appendPage(page.items, previous)
          : [...previous, ...page.items];
        writeCache({
          items: merged,
          nextCursor: page.nextCursor,
          hasMore: page.hasMore,
        });
        return merged;
      });
      setNextCursor(page.nextCursor);
      setHasMore(page.hasMore);
    } catch {
      // keep existing list on load-more failure
    } finally {
      loadingMoreRef.current = false;
      setIsLoadingMore(false);
    }
  }, [appendPage, enabled, hasMore, nextCursor, writeCache]);

  const refetch = useCallback(
    async (options?: { silent?: boolean }) => {
      await resetAndLoad({ silent: options?.silent, force: true });
    },
    [resetAndLoad],
  );

  const patchItem = useCallback(
    (updated: Partial<TItem> & Pick<TItem, 'id'>) => {
      setItems((previous) => {
        const next = previous.map((item) =>
          item.id === updated.id ? { ...item, ...updated } : item,
        );
        writeCache({ items: next, nextCursor, hasMore });
        return next;
      });
    },
    [hasMore, nextCursor, writeCache],
  );

  const removeItem = useCallback(
    (itemId: string) => {
      setItems((previous) => {
        const next = previous.filter((item) => item.id !== itemId);
        writeCache({ items: next, nextCursor, hasMore });
        return next;
      });
    },
    [hasMore, nextCursor, writeCache],
  );

  const prependItem = useCallback(
    (item: TItem) => {
      setItems((previous) => {
        if (previous.some((entry) => entry.id === item.id)) {
          return previous;
        }
        const next = [item, ...previous];
        writeCache({ items: next, nextCursor, hasMore });
        return next;
      });
    },
    [hasMore, nextCursor, writeCache],
  );

  const replaceItem = useCallback(
    (pendingId: string, item: TItem) => {
      setItems((previous) => {
        const rest = previous.filter(
          (entry) => entry.id !== pendingId && entry.id !== item.id,
        );
        const next = [item, ...rest];
        writeCache({ items: next, nextCursor, hasMore });
        return next;
      });
    },
    [hasMore, nextCursor, writeCache],
  );

  return {
    items,
    hasMore,
    isLoading,
    isRefreshing,
    isLoadingMore,
    isError,
    loadMore,
    refetch,
    patchItem,
    removeItem,
    prependItem,
    replaceItem,
  };
}
