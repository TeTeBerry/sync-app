import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import type { ConfirmDialogOptions } from '../../../hooks/useConfirmDialog';
import { useEventPostsInfiniteQuery } from '../../../hooks/useEventPostsInfiniteQuery';
import { requireAuth } from '../../../utils/authGate';
import { deletePostWithFeedback } from '../../../utils/deletePostFeedback';
import { scrollElementToCenter } from '../../../utils/scrollToCenter';
import type { EventDetailPost } from '../../../types/post';
import {
  EVENT_POST_ESTIMATED_HEIGHT_PX,
  EVENT_POSTS_INITIAL_RENDER,
  EVENT_POSTS_MAX_MOUNTED,
  EVENT_POSTS_RENDER_STEP,
  EVENT_POSTS_SLIDE_BUFFER,
} from '../../../constants/listPerf';
import { useWindowedList } from '../../../hooks/useWindowedList';
import {
  normalizeEventPostList,
  type EventPostListItem,
} from '../utils/eventPostNormalize';
import { useEventDetailPostSearch } from './useEventDetailPostSearch';
import { useEventDetailPostFilters } from './useEventDetailPostFilters';
import { filterEventDetailPostsByRules } from '../utils/filterEventDetailPostsByRules';
import { resolvePersonalityMediaUrls } from '@/domains/personality-test/utils/resolvePersonalityMedia';

export const EVENT_DETAIL_SCROLL_ID = 'event-detail-scroll';

type EventPostsQuery = ReturnType<typeof useEventPostsInfiniteQuery>;

export type UseEventDetailPostsParams = {
  activityLegacyId?: number;
  postsQuery: EventPostsQuery;
  confirm: (options: ConfirmDialogOptions) => Promise<boolean>;
  setScrollTop: (value: number | undefined) => void;
  highlightPostId?: string;
  openCommentsOnMount?: boolean;
};

export function useEventDetailPosts({
  activityLegacyId,
  postsQuery,
  confirm,
  setScrollTop,
  highlightPostId = '',
  openCommentsOnMount = false,
}: UseEventDetailPostsParams) {
  const [expandedCommentPostIds, setExpandedCommentPostIds] = useState<Set<string>>(
    () => new Set(),
  );
  const autoOpenedCommentsRef = useRef<string | null>(null);

  const postFilters = useEventDetailPostFilters(postsQuery.items);

  const ruleFilteredPosts = useMemo(
    () => filterEventDetailPostsByRules(postsQuery.items, postFilters.filters),
    [postFilters.filters, postsQuery.items],
  );

  const search = useEventDetailPostSearch({
    activityLegacyId,
    loadedPosts: ruleFilteredPosts,
    ruleFiltersActive: postFilters.isActive,
  });

  useEffect(() => {
    if (!search.isActive) return;
    postFilters.clearFilters();
  }, [search.isActive, postFilters.clearFilters]);

  const loadedPostItems = useMemo((): EventPostListItem[] => {
    const source = search.isActive ? (search.matchedPosts ?? []) : ruleFilteredPosts;
    return normalizeEventPostList(source);
  }, [ruleFilteredPosts, search.isActive, search.matchedPosts]);

  const {
    visibleItems: postItems,
    windowStart,
    windowEnd,
    hiddenCount,
    hasMoreToShow: hasMoreVisiblePosts,
    showMore: showMoreVisiblePosts,
    ensureIndexVisible,
    setScrollFocalIndex,
    resetWindow,
  } = useWindowedList(loadedPostItems, {
    initialSize: EVENT_POSTS_INITIAL_RENDER,
    step: EVENT_POSTS_RENDER_STEP,
    maxVisible: EVENT_POSTS_MAX_MOUNTED,
    slidingWindow: true,
    slideBuffer: EVENT_POSTS_SLIDE_BUFFER,
  });

  useEffect(() => {
    resetWindow();
  }, [search.isActive, postFilters.isActive, resetWindow]);

  useEffect(() => {
    const avatarKeys = loadedPostItems
      .map((item) => item.post.avatar?.trim())
      .filter((avatar): avatar is string => Boolean(avatar?.startsWith('avatar/')));
    if (!avatarKeys.length) return;
    void resolvePersonalityMediaUrls(avatarKeys);
  }, [loadedPostItems]);

  const visiblePostIds = useMemo(
    () => new Set(postItems.map((item) => item.post.id)),
    [postItems],
  );

  useEffect(() => {
    const highlight = highlightPostId.trim();
    setExpandedCommentPostIds((prev) => {
      let changed = false;
      const next = new Set<string>();
      for (const id of prev) {
        if (visiblePostIds.has(id) || id === highlight) {
          next.add(id);
        } else {
          changed = true;
        }
      }
      return changed ? next : prev;
    });
  }, [visiblePostIds, highlightPostId]);

  const handleListScroll = useCallback(
    (scrollTop: number) => {
      const index = Math.floor(scrollTop / EVENT_POST_ESTIMATED_HEIGHT_PX);
      setScrollFocalIndex(index);
    },
    [setScrollFocalIndex],
  );

  const handleScrollToLower = useCallback(() => {
    if (search.isActive || postFilters.isActive) {
      return;
    }
    if (hasMoreVisiblePosts) {
      showMoreVisiblePosts();
      return;
    }
    void postsQuery.loadMore();
  }, [
    hasMoreVisiblePosts,
    postFilters.isActive,
    search.isActive,
    showMoreVisiblePosts,
    postsQuery,
  ]);

  const scrollToElement = useCallback(
    (elementId: string) => {
      const postId = elementId.startsWith('post-')
        ? elementId.slice('post-'.length)
        : elementId;
      const index = loadedPostItems.findIndex((item) => item.post.id === postId);
      if (index >= 0) ensureIndexVisible(index);

      const targetSelector = `#${elementId}`;
      void scrollElementToCenter(
        `#${EVENT_DETAIL_SCROLL_ID}`,
        targetSelector,
        setScrollTop,
      ).then((centered) => {
        if (!centered) {
          setScrollTop(undefined);
          setTimeout(() => {
            void scrollElementToCenter(
              `#${EVENT_DETAIL_SCROLL_ID}`,
              targetSelector,
              setScrollTop,
            );
          }, 150);
        }
      });
    },
    [loadedPostItems, ensureIndexVisible, setScrollTop],
  );

  const handleDeletePost = useCallback(
    async (post: EventDetailPost) => {
      const ok = await confirm({
        title: '确认删除',
        message: '删除后无法恢复，确定要删除这条留言吗？',
        confirmText: '删除',
      });
      if (!ok) return;

      requireAuth(() => {
        void deletePostWithFeedback(post.id, {
          onRemoved: () => postsQuery.removeItem(post.id),
          refetchOnFailure: () => postsQuery.refetch({ silent: true }),
        });
      }, 'social');
    },
    [confirm, postsQuery],
  );

  const openPostComments = useCallback(
    (postId: string) => {
      const index = loadedPostItems.findIndex((item) => item.post.id === postId);
      if (index >= 0) ensureIndexVisible(index);

      setExpandedCommentPostIds((prev) => {
        if (prev.has(postId)) return prev;
        const next = new Set(prev);
        next.add(postId);
        return next;
      });
    },
    [loadedPostItems, ensureIndexVisible],
  );

  const closePostComments = useCallback((postId: string) => {
    setExpandedCommentPostIds((prev) => {
      if (!prev.has(postId)) return prev;
      const next = new Set(prev);
      next.delete(postId);
      return next;
    });
  }, []);

  useEffect(() => {
    const postId = highlightPostId.trim();
    if (!openCommentsOnMount || !postId) return;
    if (autoOpenedCommentsRef.current === postId) return;
    if (!loadedPostItems.some((item) => item.post.id === postId)) return;

    autoOpenedCommentsRef.current = postId;
    openPostComments(postId);
  }, [highlightPostId, loadedPostItems, openCommentsOnMount, openPostComments]);

  const handleCommentSubmitted = useCallback(
    (updated: Pick<EventDetailPost, 'id' | 'comments'>) => {
      postsQuery.patchItem(updated);
    },
    [postsQuery],
  );

  return {
    postItems,
    totalPostCount: loadedPostItems.length,
    hiddenPostCount: hiddenCount,
    windowStart,
    windowEnd,
    hasMoreVisiblePosts:
      search.isActive || postFilters.isActive ? false : hasMoreVisiblePosts,
    expandedCommentPostIds,
    handleListScroll,
    handleScrollToLower,
    scrollToElement,
    handleDeletePost,
    openPostComments,
    closePostComments,
    handleCommentSubmitted,
    showMoreVisiblePosts,
    searchQuery: search.query,
    setSearchQuery: search.setQuery,
    clearSearchQuery: search.clearSearch,
    searchActive: search.isActive,
    searchLoading: search.isSearching,
    searchMatchedCount: search.matchedCount,
    searchUsedLocalFallback: search.usedLocalFallback,
    postFilterCityOptions: postFilters.cityOptions,
    postFilterSelectedCity: postFilters.selectedCity,
    setPostFilterSelectedCity: postFilters.setSelectedCity,
    postFiltersActive: postFilters.isActive,
    clearPostFilters: postFilters.clearFilters,
  };
}
