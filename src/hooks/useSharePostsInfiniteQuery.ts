import { useCallback, useEffect, useRef, useState } from 'react';
import { fetchSharePostsPage } from '../api/sync/posts';
import { mapHomeFeedPost } from './sync/posts';
import { isLiveApi } from '../constants/api';
import type { HomeFeedPost } from '../types/backend';
import { getClientUserId } from '../utils/session';

const DEFAULT_PAGE_SIZE = 10;

export function useSharePostsInfiniteQuery(options?: {
  enabled?: boolean;
  pageSize?: number;
  sort?: 'new' | 'hot';
}) {
  const tabEnabled = options?.enabled ?? true;
  const pageSize = options?.pageSize ?? DEFAULT_PAGE_SIZE;
  const sort = options?.sort ?? 'new';
  const apiEnabled = isLiveApi();
  const enabled = apiEnabled && tabEnabled;

  const [items, setItems] = useState<HomeFeedPost[]>([]);
  const [nextCursor, setNextCursor] = useState<string | undefined>();
  const [hasMore, setHasMore] = useState(false);
  const [sharerCount, setSharerCount] = useState(0);
  const [isLoading, setIsLoading] = useState(false);
  const [isLoadingMore, setIsLoadingMore] = useState(false);
  const [isError, setIsError] = useState(false);
  const loadingMoreRef = useRef(false);
  const userId = getClientUserId();

  const resetAndLoad = useCallback(
    async (options?: { background?: boolean }) => {
      if (!enabled) return;
      const background = options?.background ?? false;
      if (!background) {
        setIsLoading(true);
      }
      setIsError(false);
      try {
        const page = await fetchSharePostsPage({ limit: pageSize, sort });
        setItems(page.items.map(mapHomeFeedPost));
        setNextCursor(page.nextCursor);
        setHasMore(page.hasMore);
        setSharerCount(page.sharerCount ?? 0);
      } catch {
        if (!background) {
          setIsError(true);
          setItems([]);
          setNextCursor(undefined);
          setHasMore(false);
          setSharerCount(0);
        }
      } finally {
        if (!background) {
          setIsLoading(false);
        }
      }
    },
    [enabled, pageSize, sort],
  );

  const itemsRef = useRef(items);
  itemsRef.current = items;

  useEffect(() => {
    if (!enabled) {
      setItems([]);
      setNextCursor(undefined);
      setHasMore(false);
      setSharerCount(0);
      setIsLoading(false);
      return;
    }
    const background = itemsRef.current.length > 0;
    void resetAndLoad({ background });
  }, [enabled, resetAndLoad, userId]);

  const loadMore = useCallback(async () => {
    if (!enabled || !hasMore || !nextCursor || loadingMoreRef.current) {
      return;
    }
    loadingMoreRef.current = true;
    setIsLoadingMore(true);
    try {
      const page = await fetchSharePostsPage({
        limit: pageSize,
        sort,
        cursor: nextCursor,
      });
      setItems((prev) => {
        const seen = new Set(prev.map((post) => post.id));
        const merged = [...prev];
        for (const post of page.items.map(mapHomeFeedPost)) {
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
  }, [enabled, hasMore, nextCursor, pageSize, sort]);

  const refetch = useCallback(
    async (options?: { background?: boolean }) => {
      await resetAndLoad(options);
    },
    [resetAndLoad],
  );

  const patchItem = useCallback(
    (
      updated: Pick<HomeFeedPost, 'id'> &
        Partial<Pick<HomeFeedPost, 'likes' | 'liked' | 'comments'>>,
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

  const prependItem = useCallback((post: HomeFeedPost) => {
    setItems((prev) => {
      if (prev.some((item) => item.id === post.id)) return prev;
      return [mapHomeFeedPost(post), ...prev];
    });
  }, []);

  return {
    items,
    hasMore,
    sharerCount,
    isLoading,
    isLoadingMore,
    isError,
    loadMore,
    refetch,
    patchItem,
    removeItem,
    prependItem,
  };
}
