import './home.scss';
import Taro, { useDidShow } from '@tarojs/taro';
import { lazy, Suspense, useCallback } from 'react';
import ThemedPageLoader from '../../components/ThemedPageLoader';
import { seedActivityDetailFromFeaturedEvent } from '../../utils/activityDetailCache';
import { preloadEventSubpackage } from '../../utils/subpackagePreload';
import { useConfirmDialog } from '../../hooks/useConfirmDialog';
import { useDeferredMount } from '../../hooks/useDeferredMount';
import {
  deletePostAndInvalidate,
  likePostAndInvalidate,
  useFeaturedEvents,
  useHomeSummary,
  useNearestUpcomingForCountdown,
  useNotificationUnreadCount,
  usePopularPosts,
} from '../../hooks/useSyncApi';
import { isLiveApi } from '../../constants/api';
import { requireAuth } from '../../utils/authGate';
import {
  buildEventDetailQuery,
  goAiAssistant,
  goEventDetail,
  goNotifications,
  preloadHotRoutes,
  preloadPageSafe,
  ROUTES,
} from '../../utils/route';
import { joinActivityWithAuth } from '../../utils/joinActivity';
import { useAuthSession } from '../../hooks/useAuthSession';
import { DEFER_BELOW_FOLD_MS, DEFER_SECONDARY_API_MS } from '../../utils/timing';
import { HomeCountdownCard } from './components/HomeCountdownCard';
import { HomeFeaturedEvents } from './components/HomeFeaturedEvents';
import TabPageHeader from '../../components/navigation/TabPageHeader';
import { LoginInterceptHost } from '../../components/auth/LoginInterceptHost';
import { HomeHeaderActions } from './components/HomeHeaderActions';
import type { HomeFeedPost } from '../../types/post';
import {
  resolveFeaturedEventLegacyId,
  type FeaturedEvent,
} from '../../utils/apiMappers';
import { useNavBarInsets } from '../../hooks/useNavBarInsets';
import { useEndRouteTransitionOnShow } from '../../hooks/useEndRouteTransitionOnShow';
import { usePostPageShare } from '../../hooks/usePostPageShare';
import { ScrollView, View } from '@tarojs/components';

const LazyHomeActivityFeed = lazy(async () => {
  const mod = await import('./components/HomeActivityFeed');
  return { default: mod.HomeActivityFeed };
});

const Home = () => {
  usePostPageShare();
  useEndRouteTransitionOnShow();

  useDidShow(() => {
    preloadHotRoutes(ROUTES.HOME);
  });

  const belowFoldReady = useDeferredMount(DEFER_BELOW_FOLD_MS);
  const secondaryApiReady = useDeferredMount(DEFER_SECONDARY_API_MS);
  const { confirm, confirmDialog } = useConfirmDialog({
    cancelText: '取消',
  });
  const { data: summary } = useHomeSummary();
  const heat = summary?.heat;
  const { loggedIn } = useAuthSession();
  const { items: featuredEvents } = useFeaturedEvents();
  const nearestUpcoming = useNearestUpcomingForCountdown();
  const { data: unreadCount = 0 } = useNotificationUnreadCount({
    enabled: secondaryApiReady,
  });
  const { posts, refetch: refetchPosts } = usePopularPosts({ enabled: belowFoldReady });

  const openAiAssistant = useCallback((message?: string) => {
    requireAuth(() => {
      if (message?.trim()) {
        goAiAssistant({ initialMessage: message.trim() });
        return;
      }
      goAiAssistant();
    }, 'ai_match');
  }, []);

  const handleNotification = useCallback(() => {
    requireAuth(() => goNotifications(), 'notification');
  }, []);

  const handleEventPreload = useCallback((event: FeaturedEvent) => {
    const legacyId = resolveFeaturedEventLegacyId(event);
    if (legacyId == null) {
      return;
    }
    seedActivityDetailFromFeaturedEvent(event);
    preloadEventSubpackage();
    preloadPageSafe(ROUTES.EVENT_DETAIL, buildEventDetailQuery(legacyId));
  }, []);

  const openEventDetail = useCallback((event: FeaturedEvent) => {
    const legacyId = resolveFeaturedEventLegacyId(event);
    if (legacyId == null) {
      return;
    }
    seedActivityDetailFromFeaturedEvent(event);
    goEventDetail(legacyId);
  }, []);

  const handleJoinEvent = useCallback(
    (event: FeaturedEvent) => {
      const legacyId = resolveFeaturedEventLegacyId(event);
      if (legacyId == null) {
        return;
      }
      joinActivityWithAuth(legacyId, {
        alreadyJoined: loggedIn && event.going,
        onSuccess: () => openEventDetail(event),
      });
    },
    [loggedIn, openEventDetail],
  );

  const handleDeletePost = useCallback(
    async (post: HomeFeedPost) => {
      const ok = await confirm({
        title: '确认删除',
        message: '删除后无法恢复，确定要删除这条帖子吗？',
        confirmText: '删除',
      });
      if (!ok) return;
      void deletePostAndInvalidate(post.id)
        .then(() => {
          void Taro.showToast({ title: '已删除', icon: 'success' });
        })
        .catch(() => {
          void refetchPosts();
          void Taro.showToast({ title: '删除失败', icon: 'none' });
        });
    },
    [confirm, refetchPosts],
  );

  const handleLikePost = useCallback((post: HomeFeedPost) => {
    requireAuth(() => {
      if (!isLiveApi()) {
        return;
      }
      void likePostAndInvalidate(post.id).catch(
        () => void Taro.showToast({ title: '请求失败，请稍后重试', icon: 'none' }),
      );
    }, 'social');
  }, []);

  const activeTeamCount = heat?.people ?? 0;
  const navInsets = useNavBarInsets();

  return (
    <View data-cmp="Home" className="s-page-with-tabbar">
      <ScrollView
        scrollY
        enhanced
        showScrollbar={false}
        className="s-page-with-tabbar__scroll s-home__main s-scrollbar-none"
      >
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
            onJoinClick={handleJoinEvent}
            onEventPreload={handleEventPreload}
          />

          {belowFoldReady ? (
            <Suspense
              fallback={<ThemedPageLoader variant="skeleton-feed" minHeight={240} />}
            >
              <LazyHomeActivityFeed
                items={posts}
                onDelete={handleDeletePost}
                onLike={handleLikePost}
              />
            </Suspense>
          ) : (
            <ThemedPageLoader variant="skeleton-feed" minHeight={240} />
          )}

          <View className="s-home__heat s-tabbar-offset" aria-label="Today heat">
            {activeTeamCount} 人正在发现活动
          </View>
        </View>
      </ScrollView>

      {confirmDialog}
      <LoginInterceptHost />
    </View>
  );
};

export default Home;
