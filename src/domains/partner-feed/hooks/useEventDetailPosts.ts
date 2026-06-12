import Taro from '@tarojs/taro';
import { useCallback, useMemo, useState } from 'react';
import { likePostAndInvalidate } from '../../../hooks/useSyncApi';
import type { ConfirmDialogOptions } from '../../../hooks/useConfirmDialog';
import { useEventPostsInfiniteQuery } from '../../../hooks/useEventPostsInfiniteQuery';
import { requireAuth } from '../../../utils/authGate';
import { deletePostWithFeedback } from '../../../utils/deletePostFeedback';
import { scrollElementToCenter } from '../../../utils/scrollToCenter';
import type { EventDetailPost } from '../../../types/post';
import type { EventDetailTabId } from '../components/EventDetailContentTabs';
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
  contentTab: EventDetailTabId;
  postsQuery: EventPostsQuery;
  confirm: (options: ConfirmDialogOptions) => Promise<boolean>;
  setScrollTop: (value: number | undefined) => void;
};

export function useEventDetailPosts({
  contentTab,
  postsQuery,
  confirm,
  setScrollTop,
}: UseEventDetailPostsParams) {
  const [expandedCommentPostIds, setExpandedCommentPostIds] = useState<Set<string>>(
    () => new Set(),
  );
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
    if (contentTab !== 'posts') return;
    if (hasMoreVisiblePosts) {
      showMoreVisiblePosts();
      return;
    }
    void postsQuery.loadMore();
  }, [contentTab, hasMoreVisiblePosts, showMoreVisiblePosts, postsQuery]);

  const handleLikePost = useCallback(
    (postId: string) => {
      requireAuth(() => {
        void likePostAndInvalidate(postId)
          .then((updated) => {
            postsQuery.patchItem(updated);
          })
          .catch(
            () => void Taro.showToast({ title: '请求失败，请稍后重试', icon: 'none' }),
          );
      }, 'social');
    },
    [postsQuery],
  );

  const ensurePostVisible = useCallback(
    (postId: string) => {
      const index = allPostItems.findIndex((item) => item.post.id === postId);
      if (index >= 0) {
        ensureIndexVisible(index);
      }
    },
    [allPostItems, ensureIndexVisible],
  );

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

  const togglePostComments = useCallback(
    (postId: string) => {
      const index = allPostItems.findIndex((item) => item.post.id === postId);
      if (index >= 0) ensureIndexVisible(index);

      setExpandedCommentPostIds((prev) => {
        const next = new Set(prev);
        if (next.has(postId)) {
          next.delete(postId);
        } else {
          next.add(postId);
        }
        return next;
      });
    },
    [allPostItems, ensureIndexVisible],
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

  const handleCommentSubmitted = useCallback(
    (updated: Pick<EventDetailPost, 'id' | 'comments' | 'likes' | 'liked'>) => {
      postsQuery.patchItem(updated);
    },
    [postsQuery],
  );

  return {
    postItems,
    totalPostCount: loadedPostItems.length,
    filteredPostCount: allPostItems.length,
    boardSearchQuery,
    setBoardSearchQuery,
    isBoardSearchActive,
    hasMoreVisiblePosts,
    expandedCommentPostIds,
    handleScrollToLower,
    handleLikePost,
    ensurePostVisible,
    scrollToElement,
    togglePostComments,
    handleDeletePost,
    handleCommentSubmitted,
  };
}
