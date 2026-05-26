import "./posts.scss";
import Taro from "@tarojs/taro";
import { useCallback } from "react";
import { useTranslation } from "react-i18next";
import { useQueryClient } from "@tanstack/react-query";
import PageNavigation from "../../components/PageNavigation";
import { FeedPostList } from "../../components/FeedPostList";
import { ListState } from "../../components/ListState";
import { useConfirmDialog } from "../../hooks/useConfirmDialog";
import {
  deletePostAndInvalidate,
  likePostAndInvalidate,
  useAllPostsQuery,
} from "../../hooks/useSyncApi";
import { isApiEnabled } from "../../constants/api";
import { ROUTES } from "../../utils/route";
import type { ActivityPost } from "../index/homeData";

const AllPostsPage = () => {
  const { t } = useTranslation();
  const queryClient = useQueryClient();
  const { confirm, confirmDialog } = useConfirmDialog({
    cancelText: t("common.cancel"),
  });
  const { posts, isLoading, isError, refetch } = useAllPostsQuery();

  const handleDeletePost = useCallback(
    async (post: ActivityPost) => {
      const ok = await confirm({
        title: t("home.feed.deleteConfirmTitle"),
        message: t("home.feed.deleteConfirmMessage"),
        confirmText: t("profile.myPosts.delete"),
      });
      if (!ok) return;
      void deletePostAndInvalidate(queryClient, post.id)
        .then(() => {
          void Taro.showToast({ title: t("home.feed.deleted"), icon: "success" });
        })
        .catch(() => {
          void refetch();
          void Taro.showToast({ title: t("home.feed.deleteFailed"), icon: "none" });
        });
    },
    [confirm, queryClient, refetch, t],
  );

  const handleLikePost = useCallback(
    (post: ActivityPost) => {
      if (!isApiEnabled()) {
        return;
      }
      void likePostAndInvalidate(queryClient, post.id).catch(() =>
        void Taro.showToast({ title: t("common.requestFailed"), icon: "none" }),
      );
    },
    [queryClient, t],
  );

  const handleCommentSubmitted = useCallback(() => {
    void refetch();
  }, [refetch]);

  return (
    <div data-cmp="AllPosts" className="s-posts-page">
      <PageNavigation title={t("home.feed.allPosts")} fallback={ROUTES.HOME} />

      <main className="s-posts-page__main s-scrollbar-none">
        <ListState
          isLoading={isLoading}
          isError={isError}
          isEmpty={!isLoading && !isError && posts.length === 0}
          loadingText={t("home.feed.loading")}
          errorText={t("common.requestFailed")}
          emptyText={t("home.feed.empty")}
          onRetry={() => void refetch()}
          retryText={t("common.retry")}
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
      </main>

      {confirmDialog}
    </div>
  );
};

export default AllPostsPage;
