import "./home.scss";
import Taro from "@tarojs/taro";
import { useCallback } from "react";
import { useTranslation } from "react-i18next";
import { useQueryClient } from "@tanstack/react-query";
import BottomNav from "../../components/BottomNav";
import { useConfirmDialog } from "../../hooks/useConfirmDialog";
import {
  deletePostAndInvalidate,
  likePostAndInvalidate,
  useFeaturedEvents,
  useHomeSummary,
  useNearestUpcomingForCountdown,
  useNotificationUnreadCount,
  usePopularPosts,
} from "../../hooks/useSyncApi";
import { isApiEnabled } from "../../constants/api";
import { go, goAiAssistant, goEventDetail, ROUTES } from "../../utils/route";
import { HomeActivityFeed } from "./components/HomeActivityFeed";
import { HomeCountdownCard } from "./components/HomeCountdownCard";
import { HomeFeaturedEvents } from "./components/HomeFeaturedEvents";
import { HomePlazaHero } from "./components/HomePlazaHero";
import { type ActivityPost } from "./homeData";
import { type FeaturedEvent } from "../../utils/apiMappers";

const Home = () => {
  const { t } = useTranslation();
  const queryClient = useQueryClient();
  const { confirm, confirmDialog } = useConfirmDialog({
    cancelText: t("common.cancel"),
  });
  const { heat } = useHomeSummary();
  const { items: featuredEvents } = useFeaturedEvents();
  const nearestUpcoming = useNearestUpcomingForCountdown();
  const { data: unreadCount = 0 } = useNotificationUnreadCount();
  const { posts, refetch: refetchPosts } = usePopularPosts();

  const openAiAssistant = useCallback((message?: string) => {
    if (message?.trim()) {
      goAiAssistant({ initialMessage: message.trim() });
      return;
    }
    go(ROUTES.AI_ASSISTANT);
  }, []);

  const handleNotification = useCallback(() => {
    go(ROUTES.NOTIFICATIONS);
  }, []);

  const openEventDetail = useCallback((event: FeaturedEvent) => {
    goEventDetail(event.id);
  }, []);

  const handleDeletePost = useCallback(
    async (post: ActivityPost) => {
      const ok = await confirm({
        title: "确认删除",
        message: "删除后无法恢复，确定要删除这条帖子吗？",
        confirmText: t("profile.myPosts.delete"),
      });
      if (!ok) return;
      void deletePostAndInvalidate(queryClient, post.id)
        .then(() => {
          void Taro.showToast({ title: "已删除", icon: "success" });
        })
        .catch(() => {
          void refetchPosts();
          void Taro.showToast({ title: "删除失败", icon: "none" });
        });
    },
    [confirm, queryClient, refetchPosts, t],
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
    void refetchPosts();
  }, [refetchPosts]);

  const activeTeamCount = heat.people;

  return (
    <div data-cmp="Home" className="s-home">
      <main className="s-home__main s-scrollbar-none">
        <HomePlazaHero
          unreadCount={unreadCount}
          onAgentClick={() => openAiAssistant()}
          onNotificationClick={handleNotification}
        />

        <HomeCountdownCard
          eventName={nearestUpcoming?.title}
          targetAt={nearestUpcoming?.startAt ?? null}
        />

        <HomeFeaturedEvents
          items={featuredEvents}
          onEventClick={openEventDetail}
          onJoinClick={openEventDetail}
        />

        <HomeActivityFeed
          items={posts}
          onSeeAll={() => go(ROUTES.ALL_POSTS)}
          onDelete={handleDeletePost}
          onLike={handleLikePost}
          onCommentSubmitted={handleCommentSubmitted}
        />

        <div className="s-home__heat" aria-label="Today heat">
          {activeTeamCount} 人正在发现活动
        </div>
      </main>

      {confirmDialog}

      <BottomNav />
    </div>
  );
};

export default Home;
