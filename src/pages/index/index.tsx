import "./home.scss";
import Taro from "@tarojs/taro";
import { lazy, Suspense, useCallback } from "react";
import BottomNav from "../../components/BottomNav";
import PageLoadingFallback from "../../components/PageLoadingFallback";
import { useConfirmDialog } from "../../hooks/useConfirmDialog";
import { useDeferredMount } from "../../hooks/useDeferredMount";
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
import { HomeCountdownCard } from "./components/HomeCountdownCard";
import { HomeFeaturedEvents } from "./components/HomeFeaturedEvents";
import { HomePlazaHero } from "./components/HomePlazaHero";
import { type ActivityPost } from "./homeData";
import { type FeaturedEvent } from "../../utils/apiMappers";
import { View } from '@tarojs/components';

const LazyHomeActivityFeed = lazy(async () => {
  const mod = await import("./components/HomeActivityFeed");
  return { default: mod.HomeActivityFeed };
});

const Home = () => {
  const belowFoldReady = useDeferredMount(120);
  const { confirm, confirmDialog } = useConfirmDialog({
    cancelText: "取消",
  });
  const { data: summary } = useHomeSummary();
  const heat = summary?.heat;
  const { items: featuredEvents } = useFeaturedEvents();
  const nearestUpcoming = useNearestUpcomingForCountdown({ enabled: belowFoldReady });
  const { data: unreadCount = 0 } = useNotificationUnreadCount();
  const { posts, refetch: refetchPosts } = usePopularPosts({ enabled: belowFoldReady });

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
        confirmText: "删除",
      });
      if (!ok) return;
      void deletePostAndInvalidate(post.id)
        .then(() => {
          void Taro.showToast({ title: "已删除", icon: "success" });
        })
        .catch(() => {
          void refetchPosts();
          void Taro.showToast({ title: "删除失败", icon: "none" });
        });
    },
    [confirm, refetchPosts],
  );

  const handleLikePost = useCallback(
    (post: ActivityPost) => {
      if (!isApiEnabled()) {
        return;
      }
      void likePostAndInvalidate(post.id).catch(() =>
        void Taro.showToast({ title: "请求失败，请稍后重试", icon: "none" }),
      );
    },
    [],
  );

  const handleCommentSubmitted = useCallback(() => {
    void refetchPosts();
  }, [refetchPosts]);

  const activeTeamCount = heat?.people ?? 0;

  return (
    <View data-cmp="Home" className="s-home">
      <View className="s-home__main s-scrollbar-none">
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

        {belowFoldReady ? (
          <Suspense fallback={<PageLoadingFallback minHeight={240} />}>
            <LazyHomeActivityFeed
              items={posts}
              onSeeAll={() => go(ROUTES.ALL_POSTS)}
              onDelete={handleDeletePost}
              onLike={handleLikePost}
              onCommentSubmitted={handleCommentSubmitted}
            />
          </Suspense>
        ) : (
          <PageLoadingFallback minHeight={240} />
        )}

        <View className="s-home__heat" aria-label="Today heat">
          {activeTeamCount} 人正在发现活动
        </View>
      </View>

      {confirmDialog}

      <BottomNav />
    </View>
  );
};

export default Home;
