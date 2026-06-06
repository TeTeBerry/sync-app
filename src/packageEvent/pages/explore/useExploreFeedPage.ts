import Taro from '@tarojs/taro';
import { useCallback, useMemo, useState } from 'react';
import {
  deletePostAndInvalidate,
  invalidatePostQueries,
  likePostAndInvalidate,
  useCurrentUserQuery,
} from '../../../hooks/useSyncApi';
import { useSharePostsInfiniteQuery } from '../../../hooks/useSharePostsInfiniteQuery';
import { useWindowedList } from '../../../hooks/useWindowedList';
import {
  EXPLORE_SHARE_POSTS_INITIAL_RENDER,
  EXPLORE_SHARE_POSTS_RENDER_STEP,
} from '../../../constants/listPerf';
import { useAccountRisk } from '../../../hooks/useAccountRisk';
import { useConfirmDialog } from '../../../hooks/useConfirmDialog';
import { isApiEnabled, isLiveApi } from '../../../constants/api';
import type { HomeFeedPost } from '../../../types/post';
import { requireAuth } from '../../../utils/authGate';
import { getApiErrorMessage } from '../../../utils/apiErrorMessage';
import { publishSharePost } from '../../../utils/publishSharePost';
import { useExploreShareActivity } from './useExploreShareActivity';

export type ExploreFeedTab = 'all' | 'hot' | 'nearby' | 'following';

function filterExplorePosts(
  posts: HomeFeedPost[],
  tab: ExploreFeedTab,
): HomeFeedPost[] {
  if (tab === 'following') {
    return [];
  }

  let next = posts;

  if (tab === 'nearby') {
    next = next.filter((post) => {
      const location = post.location?.trim() ?? '';
      return location.includes('深圳') || location.includes('广州');
    });
  }

  if (tab === 'hot') {
    next = [...next].sort((a, b) => b.likes - a.likes || b.comments - a.comments);
  }

  return next;
}

export function useExploreFeedPage() {
  const [activeTab, setActiveTab] = useState<ExploreFeedTab>('all');
  const { data: currentUser } = useCurrentUserQuery();
  const shareActivity = useExploreShareActivity();
  const { guardPublish, handlePublishError } = useAccountRisk();
  const { confirm, confirmDialog } = useConfirmDialog({ cancelText: '取消' });

  const apiSort = activeTab === 'hot' ? 'hot' : 'new';
  const postsQuery = useSharePostsInfiniteQuery({ sort: apiSort });

  const allPosts = useMemo(
    () => filterExplorePosts(postsQuery.items, activeTab),
    [activeTab, postsQuery.items],
  );

  const {
    visibleItems: visiblePosts,
    hasMoreToShow: hasMoreVisiblePosts,
    showMore: showMoreVisiblePosts,
  } = useWindowedList(allPosts, {
    initialSize: EXPLORE_SHARE_POSTS_INITIAL_RENDER,
    step: EXPLORE_SHARE_POSTS_RENDER_STEP,
  });

  const handleScrollToLower = useCallback(() => {
    if (activeTab === 'following') return;
    if (hasMoreVisiblePosts) {
      showMoreVisiblePosts();
      return;
    }
    void postsQuery.loadMore();
  }, [activeTab, hasMoreVisiblePosts, postsQuery, showMoreVisiblePosts]);

  const sharerCount = useMemo(() => {
    if (postsQuery.sharerCount > 0) return postsQuery.sharerCount;
    const authors = new Set(
      postsQuery.items
        .map((post) => post.userId)
        .filter((id): id is string => Boolean(id)),
    );
    return authors.size;
  }, [postsQuery.items, postsQuery.sharerCount]);

  const showFeedEnd =
    activeTab !== 'following' &&
    allPosts.length > 0 &&
    !postsQuery.isLoading &&
    !hasMoreVisiblePosts &&
    !postsQuery.hasMore &&
    !postsQuery.isLoadingMore;

  const handleLike = useCallback(
    (post: HomeFeedPost) => {
      requireAuth(() => {
        void likePostAndInvalidate(post.id)
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

  const handleDelete = useCallback(
    async (post: HomeFeedPost) => {
      const ok = await confirm({
        title: '确认删除',
        message: '删除后无法恢复，确定要删除这条分享吗？',
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

  const handlePublish = useCallback(
    async (payload: { body: string; images: string[] }): Promise<boolean> => {
      if (!isLiveApi()) {
        void Taro.showToast({ title: '请先配置 API 地址', icon: 'none' });
        return false;
      }

      const trimmed = payload.body.trim();
      if (!trimmed && !payload.images.length) {
        void Taro.showToast({ title: '写点什么或添加图片吧', icon: 'none' });
        return false;
      }

      if (!(await guardPublish())) {
        return false;
      }

      try {
        if (!isApiEnabled()) {
          throw new Error('请先配置 API 地址');
        }

        await publishSharePost({
          body: trimmed,
          imageRefs: payload.images,
          activityLegacyId: shareActivity.activityLegacyId,
          eventTitle: shareActivity.eventTitle,
          location: shareActivity.location,
          tags: ['#现场'],
        });

        await invalidatePostQueries();
        await postsQuery.refetch();
        setActiveTab('all');
        return true;
      } catch (error) {
        if (await handlePublishError(error)) {
          return false;
        }
        void Taro.showToast({
          title: getApiErrorMessage(error, '发布失败，请稍后重试'),
          icon: 'none',
        });
        return false;
      }
    },
    [
      guardPublish,
      handlePublishError,
      postsQuery,
      shareActivity.activityLegacyId,
      shareActivity.eventTitle,
      shareActivity.location,
    ],
  );

  const emptyMessage =
    activeTab === 'following'
      ? '关注功能即将上线'
      : isLiveApi()
        ? '暂无分享，来发第一条吧'
        : '请配置 API 后查看分享帖';

  return {
    activeTab,
    setActiveTab,
    posts: visiblePosts,
    isLoading: postsQuery.isLoading,
    isError: postsQuery.isError,
    refetch: postsQuery.refetch,
    handleLike,
    handleDelete,
    handlePublish,
    handleScrollToLower,
    showFeedEnd,
    sharerCount,
    hasMoreVisiblePosts,
    hasMoreRemote: postsQuery.hasMore,
    isLoadingMore: postsQuery.isLoadingMore,
    currentUserAvatar: currentUser?.avatar,
    emptyMessage,
    confirmDialog,
    shareActivity,
  };
}
