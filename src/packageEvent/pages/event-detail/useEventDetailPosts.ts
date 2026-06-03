import Taro from '@tarojs/taro';
import { useCallback, useMemo, useState } from 'react';
import {
  deletePostAndInvalidate,
  likePostAndInvalidate,
  updatePostAndInvalidate,
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
  apiEnabled: boolean;
  confirm: (options: ConfirmDialogOptions) => Promise<boolean>;
  setScrollTop: (value: number | undefined) => void;
};

export function useEventDetailPosts({
  contentTab,
  postsQuery,
  apiEnabled,
  confirm,
  setScrollTop,
}: UseEventDetailPostsParams) {
  const [appliedPostIds, setAppliedPostIds] = useState<Set<string>>(() => new Set());
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
        if (!apiEnabled) return;
        void likePostAndInvalidate(postId)
          .then((updated) => {
            postsQuery.patchItem(updated);
          })
          .catch(
            () => void Taro.showToast({ title: '请求失败，请稍后重试', icon: 'none' }),
          );
      }, 'social');
    },
    [apiEnabled, postsQuery],
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
        message: '删除后无法恢复，确定要删除这条帖子吗？',
        confirmText: '删除',
      });
      if (!ok) return;
      if (!apiEnabled) {
        void Taro.showToast({ title: '已删除', icon: 'success' });
        return;
      }
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
    [apiEnabled, confirm, postsQuery],
  );

  const handleCommentSubmitted = useCallback(
    (updated: Pick<EventDetailPost, 'id' | 'comments' | 'likes' | 'liked'>) => {
      postsQuery.patchItem(updated);
    },
    [postsQuery],
  );

  const handleCompletePost = useCallback(
    async (postId: string) => {
      const ok = await confirm({
        title: '确认标记为已组队',
        message: '标记后该帖子将结束招募，同类型帖子可重新发布。确定要继续吗？',
        confirmText: '确认',
      });
      if (!ok) return;
      if (!apiEnabled) {
        void Taro.showToast({ title: '已标记为已组队', icon: 'success' });
        return;
      }
      void updatePostAndInvalidate(postId, { status: 'completed' })
        .then((updated) => {
          postsQuery.patchItem({ id: postId, status: updated.status });
          void Taro.showToast({ title: '已标记为已组队', icon: 'success' });
        })
        .catch(() => {
          void Taro.showToast({ title: '标记失败', icon: 'none' });
        });
    },
    [apiEnabled, confirm, postsQuery],
  );

  return {
    postItems,
    totalPostCount: allPostItems.length,
    hasMoreVisiblePosts,
    appliedPostIds,
    setAppliedPostIds,
    expandedCommentPostIds,
    handleScrollToLower,
    handleLikePost,
    ensurePostVisible,
    scrollToElement,
    togglePostComments,
    handleDeletePost,
    handleCommentSubmitted,
    handleCompletePost,
  };
}
