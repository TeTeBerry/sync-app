import "./home.scss";
import Taro from "@tarojs/taro";
import { useCallback } from "react";
import { useQueryClient } from "@tanstack/react-query";
import BottomNav from "../../components/BottomNav";
import {
  deletePostAndInvalidate,
  useHomeSummary,
  useNotificationUnreadCount,
  usePopularPosts,
} from "../../hooks/useSyncApi";
import { go, goAiAssistant, goEventDetail, ROUTES } from "../../utils/route";
import { HomeActivityFeed } from "./components/HomeActivityFeed";
import { HomeCountdownCard } from "./components/HomeCountdownCard";
import { HomeFeaturedEvents } from "./components/HomeFeaturedEvents";
import { HomePlazaHero } from "./components/HomePlazaHero";
import { countdownParts, featuredEvents, type ActivityPost, type FeaturedEvent } from "./homeData";

const Home = () => {
  const queryClient = useQueryClient();
  const { heat } = useHomeSummary();
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

  const joinEvent = useCallback((event: FeaturedEvent) => {
    goEventDetail(event.id);
  }, []);

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

  const activeTeamCount = heat.teamOrders;

  return (
    <div data-cmp="Home" className="s-home">
      <main className="s-home__main s-scrollbar-none">
        <HomePlazaHero
          unreadCount={unreadCount}
          onAgentClick={() => openAiAssistant()}
          onNotificationClick={handleNotification}
        />

        <HomeCountdownCard eventName="Tomorrowland China" parts={countdownParts} />

        <HomeFeaturedEvents
          items={featuredEvents}
          onEventClick={openEventDetail}
          onJoinClick={joinEvent}
        />

        <HomeActivityFeed items={posts} onSeeAll={() => go(ROUTES.EVENTS)} onDelete={handleDeletePost} />

        <div className="s-home__heat" aria-label="Today heat">
          {heat.people} 人正在发现 · {activeTeamCount} 个组队进行中
        </div>
      </main>

      <BottomNav />
    </div>
  );
};

export default Home;
