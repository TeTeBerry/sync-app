import { useCallback, useEffect, useRef, useState } from 'react';
import { fetchPostsByActivityPage } from '../api/syncApi';
import { isLiveApi } from '../constants/api';
import type { EventDetailPost } from '../types/backend';
import { getClientUserId } from '../utils/session';

const DEFAULT_PAGE_SIZE = 10;

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
      const fetchedIds = new Set(fetched.map((post) => post.id));
      const localOnly = previous.filter((post) => !fetchedIds.has(post.id));
      return [...localOnly, ...fetched];
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
    (
      updated: Pick<EventDetailPost, 'id'> &
        Partial<
          Pick<
            EventDetailPost,
            'likes' | 'liked' | 'comments' | 'status' | 'appliedByMe'
          >
        >,
    ) => {
      setItems((prev) =>
        prev.map((post) =>
          post.id === updated.id
            ? {
                ...post,
                ...(updated.likes !== undefined ? { likes: updated.likes } : {}),
                ...(updated.liked !== undefined ? { liked: updated.liked } : {}),
                ...(updated.comments !== undefined
                  ? { comments: updated.comments }
                  : {}),
                ...(updated.status !== undefined ? { status: updated.status } : {}),
                ...(updated.appliedByMe !== undefined
                  ? { appliedByMe: updated.appliedByMe }
                  : {}),
              }
            : post,
        ),
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
      const withoutPending = prev.filter((item) => item.id !== pendingId);
      if (withoutPending.some((item) => item.id === post.id)) {
        return withoutPending;
      }
      return [post, ...withoutPending];
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
