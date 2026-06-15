import { useCallback, useMemo, useState } from 'react';
import type { ConfirmDialogOptions } from '../../../hooks/useConfirmDialog';
import { useEventPostsInfiniteQuery } from '../../../hooks/useEventPostsInfiniteQuery';
import { requireAuth } from '../../../utils/authGate';
import { deletePostWithFeedback } from '../../../utils/deletePostFeedback';
import { scrollElementToCenter } from '../../../utils/scrollToCenter';
import type { EventDetailPost } from '../../../types/post';
import {
  EVENT_POSTS_INITIAL_RENDER,
  EVENT_POSTS_RENDER_STEP,
} from '../../../constants/listPerf';
import { useWindowedList } from '../../../hooks/useWindowedList';
import {
  normalizeEventPostList,
  type EventPostListItem,
} from '../utils/eventPostNormalize';
import { messageBoardPostMatchesQuery } from '../utils/messageBoardPostSearch';

export const EVENT_DETAIL_SCROLL_ID = 'event-detail-scroll';

type EventPostsQuery = ReturnType<typeof useEventPostsInfiniteQuery>;

export type UseEventDetailPostsParams = {
  postsQuery: EventPostsQuery;
  confirm: (options: ConfirmDialogOptions) => Promise<boolean>;
  setScrollTop: (value: number | undefined) => void;
};

export function useEventDetailPosts({
  postsQuery,
  confirm,
  setScrollTop,
}: UseEventDetailPostsParams) {
  const [boardSearchQuery, setBoardSearchQuery] = useState('');

  const loadedPostItems = useMemo(
    (): EventPostListItem[] => normalizeEventPostList(postsQuery.items),
    [postsQuery.items],
  );

  const trimmedBoardSearch = boardSearchQuery.trim();
  const isBoardSearchActive = trimmedBoardSearch.length > 0;

  const allPostItems = useMemo((): EventPostListItem[] => {
    if (!isBoardSearchActive) return loadedPostItems;
    return loadedPostItems.filter((item) =>
      messageBoardPostMatchesQuery(item.post, trimmedBoardSearch),
    );
  }, [isBoardSearchActive, loadedPostItems, trimmedBoardSearch]);

  const {
    visibleItems: postItems,
    hasMoreToShow: hasMoreVisiblePosts,
    showMore: showMoreVisiblePosts,
    ensureIndexVisible,
  } = useWindowedList(allPostItems, {
    initialSize: EVENT_POSTS_INITIAL_RENDER,
    step: EVENT_POSTS_RENDER_STEP,
  });

  const handleScrollToLower = useCallback(() => {
    if (hasMoreVisiblePosts) {
      showMoreVisiblePosts();
      return;
    }
    void postsQuery.loadMore();
  }, [hasMoreVisiblePosts, showMoreVisiblePosts, postsQuery]);

  const scrollToElement = useCallback(
    (elementId: string) => {
      const postId = elementId.startsWith('post-')
        ? elementId.slice('post-'.length)
        : elementId;
      const index = allPostItems.findIndex((item) => item.post.id === postId);
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
    [allPostItems, ensureIndexVisible, setScrollTop],
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

  return {
    postItems,
    totalPostCount: loadedPostItems.length,
    filteredPostCount: allPostItems.length,
    boardSearchQuery,
    setBoardSearchQuery,
    isBoardSearchActive,
    hasMoreVisiblePosts,
    handleScrollToLower,
    scrollToElement,
    handleDeletePost,
  };
}
