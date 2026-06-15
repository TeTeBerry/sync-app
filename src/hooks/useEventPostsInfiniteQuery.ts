import { useCallback, useEffect, useRef, useState } from 'react';
import { fetchPostsByActivityPage } from '../api/syncApi';
import { isLiveApi } from '../constants/api';
import type { EventDetailPost } from '../types/backend';
import { getClientUserId } from '../utils/session';

const DEFAULT_PAGE_SIZE = 10;

function parsePostCreatedAtMs(createdAt?: string): number {
  if (!createdAt) return 0;
  const ms = Date.parse(createdAt);
  return Number.isFinite(ms) ? ms : 0;
}

/** Newest first — matches backend activity feed ordering. */
function sortPostsNewestFirst(posts: EventDetailPost[]): EventDetailPost[] {
  return [...posts].sort((a, b) => {
    const timeDiff =
      parsePostCreatedAtMs(b.createdAt) - parsePostCreatedAtMs(a.createdAt);
    if (timeDiff !== 0) return timeDiff;
    return b.id.localeCompare(a.id);
  });
}

export function useEventPostsInfiniteQuery(
  activityLegacyId?: number,
  options?: {
    enabled?: boolean;
    pageSize?: number;
    anchorPostId?: string;
  },
) {
  const tabEnabled = options?.enabled ?? true;
  const pageSize = options?.pageSize ?? DEFAULT_PAGE_SIZE;
  const anchorPostId = options?.anchorPostId?.trim() || undefined;
  const apiEnabled = isLiveApi();
  const enabled =
    apiEnabled &&
    activityLegacyId != null &&
    !Number.isNaN(activityLegacyId) &&
    activityLegacyId > 0 &&
    tabEnabled;

  const [items, setItems] = useState<EventDetailPost[]>([]);
  const [nextCursor, setNextCursor] = useState<string | undefined>();
  const [hasMore, setHasMore] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [isLoadingMore, setIsLoadingMore] = useState(false);
  const [isError, setIsError] = useState(false);
  const loadingMoreRef = useRef(false);
  const userId = getClientUserId();

  const mergeFetchedPosts = useCallback(
    (fetched: EventDetailPost[], previous: EventDetailPost[]) => {
      const byId = new Map<string, EventDetailPost>();
      for (const post of previous) {
        byId.set(post.id, post);
      }
      for (const post of fetched) {
        byId.set(post.id, post);
      }
      return sortPostsNewestFirst([...byId.values()]);
    },
    [],
  );

  const resetAndLoad = useCallback(
    async (options?: { silent?: boolean }) => {
      if (!enabled || activityLegacyId == null) return;
      const silent = options?.silent === true;
      if (silent) {
        setIsRefreshing(true);
      } else {
        setIsLoading(true);
      }
      setIsError(false);
      try {
        const page = await fetchPostsByActivityPage(activityLegacyId, {
          limit: pageSize,
          anchorPostId,
        });
        setItems((previous) =>
          silent ? mergeFetchedPosts(page.items, previous) : page.items,
        );
        setNextCursor(page.nextCursor);
        setHasMore(page.hasMore);
      } catch {
        if (!silent) {
          setIsError(true);
          setItems([]);
          setNextCursor(undefined);
          setHasMore(false);
        }
      } finally {
        if (silent) {
          setIsRefreshing(false);
        } else {
          setIsLoading(false);
        }
      }
    },
    [activityLegacyId, anchorPostId, enabled, mergeFetchedPosts, pageSize],
  );

  useEffect(() => {
    if (!enabled) {
      setItems([]);
      setNextCursor(undefined);
      setHasMore(false);
      setIsLoading(false);
      return;
    }
    void resetAndLoad();
  }, [enabled, resetAndLoad, userId]);

  const loadMore = useCallback(async () => {
    if (
      !enabled ||
      activityLegacyId == null ||
      !hasMore ||
      !nextCursor ||
      loadingMoreRef.current
    ) {
      return;
    }
    loadingMoreRef.current = true;
    setIsLoadingMore(true);
    try {
      const page = await fetchPostsByActivityPage(activityLegacyId, {
        limit: pageSize,
        cursor: nextCursor,
      });
      setItems((prev) => {
        const seen = new Set(prev.map((p) => p.id));
        const merged = [...prev];
        for (const post of page.items) {
          if (!seen.has(post.id)) {
            merged.push(post);
            seen.add(post.id);
          }
        }
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
  }, [activityLegacyId, enabled, hasMore, nextCursor, pageSize]);

  const refetch = useCallback(
    async (options?: { silent?: boolean }) => {
      await resetAndLoad(options);
    },
    [resetAndLoad],
  );

  const patchItem = useCallback(
    (updated: Partial<EventDetailPost> & Pick<EventDetailPost, 'id'>) => {
      setItems((prev) =>
        prev.map((post) => (post.id === updated.id ? { ...post, ...updated } : post)),
      );
    },
    [],
  );

  const removeItem = useCallback((postId: string) => {
    setItems((prev) => prev.filter((post) => post.id !== postId));
  }, []);

  const prependItem = useCallback((post: EventDetailPost) => {
    setItems((prev) => {
      if (prev.some((item) => item.id === post.id)) return prev;
      return [post, ...prev];
    });
  }, []);

  const replaceItem = useCallback((pendingId: string, post: EventDetailPost) => {
    setItems((prev) => {
      const rest = prev.filter((item) => item.id !== pendingId && item.id !== post.id);
      return [post, ...rest];
    });
  }, []);

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
