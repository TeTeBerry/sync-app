import "./posts.scss";
import Taro from "@tarojs/taro";
import { useCallback } from "react";
import PageNavigation from "../../../components/PageNavigation";
import { FeedPostList } from "../../../components/FeedPostList";
import { ListState } from "../../../components/ListState";
import ThemedPageLoader from "../../../components/ThemedPageLoader";
import { useConfirmDialog } from "../../../hooks/useConfirmDialog";
import {
  deletePostAndInvalidate,
  likePostAndInvalidate,
  useAllPostsQuery,
} from "../../../hooks/useSyncApi";
import { isApiEnabled } from "../../../constants/api";
import { ROUTES } from "../../../utils/route";
import type { ActivityPost } from "../../../pages/index/homeData";
import { useStackPageMainHeight } from "../../../hooks/useTabPageMainHeight";
import { usePostPageShare } from "../../../hooks/usePostPageShare";
import { useEndRouteTransitionOnShow } from "../../../hooks/useEndRouteTransitionOnShow";
import { ScrollView, View } from "@tarojs/components";

const AllPostsPage = () => {
  useEndRouteTransitionOnShow();
  usePostPageShare();
  const mainScrollHeight = useStackPageMainHeight();
  const { confirm, confirmDialog } = useConfirmDialog({
    cancelText: "取消",
  });
  const { posts, isLoading, isError, refetch } = useAllPostsQuery();

  const handleDeletePost = useCallback(
    async (post: ActivityPost) => {
      const ok = await confirm({
        title: "确认删除",
        message: "删除后无法恢复，确定要删除这条帖子吗？",
        confirmText: "删除",
      });
      if (!ok) return;
      void deletePostAndInvalidate(post.id)
        .then(() => {
          void Taro.showToast({ title: "已删除", icon: "success" });
        })
        .catch(() => {
          void refetch();
          void Taro.showToast({ title: "删除失败", icon: "none" });
        });
    },
    [confirm, refetch],
  );

  const handleLikePost = useCallback((post: ActivityPost) => {
    if (!isApiEnabled()) {
      return;
    }
    void likePostAndInvalidate(post.id).catch(
      () => void Taro.showToast({ title: "请求失败，请稍后重试", icon: "none" }),
    );
  }, []);

  const handleCommentSubmitted = useCallback(() => {
    void refetch();
  }, [refetch]);

  return (
    <View data-cmp="AllPosts" className="s-posts-page">
      <PageNavigation title="所有帖子" fallback={ROUTES.HOME} />

      <ScrollView
        scrollY
        enhanced
        showScrollbar={false}
        className="s-posts-page__main s-scrollbar-none"
        style={mainScrollHeight != null ? { height: `${mainScrollHeight}px` } : undefined}
      >
        {isLoading && posts.length === 0 ? (
          <ThemedPageLoader variant="skeleton-feed" minHeight={280} />
        ) : (
          <ListState
            isLoading={false}
            isError={isError}
            isEmpty={!isError && posts.length === 0}
            loadingText="加载中…"
            errorText="请求失败，请稍后重试"
            emptyText="暂无帖子"
            onRetry={() => void refetch()}
            retryText="重试"
            stateClassName="s-posts-page__state"
            retryClassName="s-posts-page__retry"
          >
            <FeedPostList
              items={posts}
              onDelete={handleDeletePost}
              onLike={handleLikePost}
              onCommentSubmitted={handleCommentSubmitted}
            />
          </ListState>
        )}
      </ScrollView>

      {confirmDialog}
    </View>
  );
};

export default AllPostsPage;
