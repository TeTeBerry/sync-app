import "./home.scss";
import Taro from "@tarojs/taro";
import { useCallback } from "react";
import { useQueryClient } from "@tanstack/react-query";
import BottomNav from "../../components/BottomNav";
import {
  commentPostAndInvalidate,
  deletePostAndInvalidate,
  likePostAndInvalidate,
  registerForActivityAndInvalidate,
  useFeaturedEvents,
  useHomeSummary,
  useNotificationUnreadCount,
  usePopularPosts,
} from "../../hooks/useSyncApi";
import { isApiEnabled } from "../../constants/api";
import { getActivityStatusFromActivity } from "../../utils/activityStatus";
import { promptText } from "../../utils/promptText";
import { go, goAiAssistant, goEventDetail, ROUTES } from "../../utils/route";
import { HomeActivityFeed } from "./components/HomeActivityFeed";
import { HomeCountdownCard } from "./components/HomeCountdownCard";
import { HomeFeaturedEvents } from "./components/HomeFeaturedEvents";
import { HomePlazaHero } from "./components/HomePlazaHero";
import { type ActivityPost, type FeaturedEvent } from "./homeData";

const Home = () => {
  const queryClient = useQueryClient();
  const { heat } = useHomeSummary();
  const { items: featuredEvents } = useFeaturedEvents();
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

  const joinEvent = useCallback(
    (event: FeaturedEvent) => {
      if (getActivityStatusFromActivity(event.date, event.title) === "ended") {
        return;
      }
      if (!isApiEnabled()) {
        goEventDetail(event.id);
        return;
      }
      void registerForActivityAndInvalidate(queryClient, event.id)
        .then((result) => {
          const title = result.alreadyRegistered ? "已报名" : "报名成功";
          void Taro.showToast({ title, icon: "success" });
          goEventDetail(event.id);
        })
        .catch(() => {
          void Taro.showToast({ title: "报名失败", icon: "none" });
        });
    },
    [queryClient],
  );

  const handleDeletePost = useCallback(
    (post: ActivityPost) => {
      void Taro.showModal({
        title: "确认删除",
        content: "删除后无法恢复，确定要删除这条帖子吗？",
        confirmText: "删除",
        cancelText: "取消",
        success: (res) => {
          if (!res.confirm) return;
          void deletePostAndInvalidate(queryClient, post.id)
            .then(() => {
              void Taro.showToast({ title: "已删除", icon: "success" });
            })
            .catch(() => {
              void refetchPosts();
              void Taro.showToast({ title: "删除失败", icon: "none" });
            });
        },
      });
    },
    [queryClient, refetchPosts],
  );

  const handleLikePost = useCallback(
    (post: ActivityPost) => {
      if (!isApiEnabled()) {
        void Taro.showToast({ title: "已点赞", icon: "none" });
        return;
      }
      void likePostAndInvalidate(queryClient, post.id)
        .then(() => void refetchPosts())
        .catch(() => void Taro.showToast({ title: "操作失败", icon: "none" }));
    },
    [queryClient, refetchPosts],
  );

  const handleCommentPost = useCallback(
    (post: ActivityPost) => {
      if (!isApiEnabled()) {
        void Taro.showToast({ title: "请开启 API 模式", icon: "none" });
        return;
      }
      const body = promptText("写评论");
      if (!body) return;
      void commentPostAndInvalidate(queryClient, post.id, body)
        .then(() => {
          void refetchPosts();
          void Taro.showToast({ title: "评论成功", icon: "success" });
        })
        .catch(() => void Taro.showToast({ title: "评论失败", icon: "none" }));
    },
    [queryClient, refetchPosts],
  );

  const activeTeamCount = heat.people;

  return (
    <div data-cmp="Home" className="s-home">
      <main className="s-home__main s-scrollbar-none">
        <HomePlazaHero
          unreadCount={unreadCount}
          onAgentClick={() => openAiAssistant()}
          onNotificationClick={handleNotification}
        />

        <HomeCountdownCard />

        <HomeFeaturedEvents
          items={featuredEvents}
          onEventClick={openEventDetail}
          onJoinClick={joinEvent}
        />

        <HomeActivityFeed
          items={posts}
          onSeeAll={() => go(ROUTES.EVENTS)}
          onDelete={handleDeletePost}
          onLike={handleLikePost}
          onComment={handleCommentPost}
        />

        <div className="s-home__heat" aria-label="Today heat">
          {activeTeamCount} 人正在发现活动
        </div>
      </main>

      <BottomNav />
    </div>
  );
};

export default Home;
