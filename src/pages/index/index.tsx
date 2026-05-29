import "./home.scss";
import Taro from "@tarojs/taro";
import { lazy, Suspense, useCallback } from "react";
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
import { go, goAiAssistant, goEventDetail, goNotifications, preloadPageSafe, ROUTES } from "../../utils/route";
import { DEFER_BELOW_FOLD_MS, DEFER_SECONDARY_API_MS } from "../../utils/timing";
import { HomeCountdownCard } from "./components/HomeCountdownCard";
import { HomeFeaturedEvents } from "./components/HomeFeaturedEvents";
import TabPageHeader from "../../components/TabPageHeader";
import { HomeHeaderActions } from "./components/HomeHeaderActions";
import { type ActivityPost } from "./homeData";
import { resolveFeaturedEventLegacyId, type FeaturedEvent } from "../../utils/apiMappers";
import { useNavBarInsets } from "../../hooks/useNavBarInsets";
import { ScrollView, View } from "@tarojs/components";

const LazyHomeActivityFeed = lazy(async () => {
  const mod = await import("./components/HomeActivityFeed");
  return { default: mod.HomeActivityFeed };
});

const Home = () => {
  const belowFoldReady = useDeferredMount(DEFER_BELOW_FOLD_MS);
  const secondaryApiReady = useDeferredMount(DEFER_SECONDARY_API_MS);
  const { confirm, confirmDialog } = useConfirmDialog({
    cancelText: "取消",
  });
  const { data: summary } = useHomeSummary();
  const heat = summary?.heat;
  const { items: featuredEvents } = useFeaturedEvents();
  const nearestUpcoming = useNearestUpcomingForCountdown();
  const { data: unreadCount = 0 } = useNotificationUnreadCount({
    enabled: secondaryApiReady,
  });
  const { posts, refetch: refetchPosts } = usePopularPosts({ enabled: belowFoldReady });

  const openAiAssistant = useCallback((message?: string) => {
    if (message?.trim()) {
      goAiAssistant({ initialMessage: message.trim() });
      return;
    }
    goAiAssistant();
  }, []);

  const handleNotification = useCallback(() => {
    goNotifications();
  }, []);

  const openEventDetail = useCallback((event: FeaturedEvent) => {
    const legacyId = resolveFeaturedEventLegacyId(event);
    if (legacyId == null) {
      return;
    }
    preloadPageSafe(ROUTES.EVENT_DETAIL, { activityLegacyId: String(legacyId) });
    goEventDetail(legacyId);
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
  const navInsets = useNavBarInsets();

  return (
    <View data-cmp="Home" className="s-page-with-tabbar">
      <ScrollView
        scrollY
        enhanced
        showScrollbar={false}
        className="s-page-with-tabbar__scroll s-home__main s-scrollbar-none">
        <View className="s-home__scroll-inner">
          <TabPageHeader
            className="s-tab-page-header--home"
            navInsets={navInsets}
            paddingRightGutterPx={16}
            trailing={
              <HomeHeaderActions
                unreadCount={unreadCount}
                onAgentClick={() => openAiAssistant()}
                onNotificationClick={handleNotification}
              />
            }
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

          <View className="s-home__heat s-tabbar-offset" aria-label="Today heat">
            {activeTeamCount} 人正在发现活动
          </View>
        </View>
      </ScrollView>

      {confirmDialog}
    </View>
  );
};

export default Home;
