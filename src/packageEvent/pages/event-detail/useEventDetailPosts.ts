import Taro from '@tarojs/taro';
import { useCallback, useMemo, useState } from 'react';
import {
  deletePostAndInvalidate,
  likePostAndInvalidate,
} from '../../../hooks/useSyncApi';
import type { ConfirmDialogOptions } from '../../../hooks/useConfirmDialog';
import { useEventPostsInfiniteQuery } from '../../../hooks/useEventPostsInfiniteQuery';
import { requireAuth } from '../../../utils/authGate';
import { scrollElementToCenter } from '../../../utils/scrollToCenter';
import type { EventDetailPost } from '../../../types/post';
import type { EventDetailTabId } from './components/EventDetailContentTabs';
import {
  EVENT_POSTS_INITIAL_RENDER,
  EVENT_POSTS_RENDER_STEP,
} from '../../../constants/listPerf';
import { useWindowedList } from '../../../hooks/useWindowedList';
import {
  normalizeEventPostList,
  type EventPostListItem,
} from './utils/eventPostNormalize';

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

  const allPostItems = useMemo(
    (): EventPostListItem[] => normalizeEventPostList(postsQuery.items),
    [postsQuery.items],
  );

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
      void deletePostAndInvalidate(post.id)
        .then(() => {
          postsQuery.removeItem(post.id);
          void Taro.showToast({ title: '已删除', icon: 'success' });
        })
        .catch(() => {
          void postsQuery.refetch();
          void Taro.showToast({ title: '删除失败', icon: 'none' });
        });
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
    totalPostCount: allPostItems.length,
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
