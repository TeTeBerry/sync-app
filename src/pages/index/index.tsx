import './home.scss';
import { useDidShow } from '@tarojs/taro';
import { useCallback } from 'react';
import ThemedPageLoader from '../../components/ThemedPageLoader';
import { HomeActivityFeed } from './components/HomeActivityFeed';
import { seedActivityDetailFromFeaturedEvent } from '../../utils/activityDetailCache';
import { preloadEventSubpackage } from '../../utils/subpackagePreload';
import { useConfirmDialog } from '../../hooks/useConfirmDialog';
import {
  useFeaturedEvents,
  useHomeSummary,
  useNearestUpcomingForCountdown,
  useNotificationUnreadCount,
  usePopularPosts,
} from '../../hooks/useSyncApi';
import { requireAuth } from '../../utils/authGate';
import {
  buildEventDetailQuery,
  goEventDetail,
  goNotifications,
  preloadHotRoutes,
  preloadPageSafe,
  ROUTES,
} from '../../utils/route';
import { joinActivityWithAuth } from '../../utils/joinActivity';
import { isLoggedIn } from '../../utils/authStorage';
import { deletePostWithFeedback } from '../../utils/deletePostFeedback';
import { useAuthSession } from '../../hooks/useAuthSession';
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
import { OverlayAwareScrollView } from '../../components/layout/OverlayAwareScrollView';
import { Text, View } from '@tarojs/components';

const Home = () => {
  useEndRouteTransitionOnShow();
  const { confirm, confirmDialog } = useConfirmDialog({
    cancelText: '取消',
  });

  useDidShow(() => {
    preloadHotRoutes(ROUTES.HOME);
    if (isLoggedIn()) {
      void refetchHomeSummary({ background: true });
    }
  });

  const { data: summary, refetch: refetchHomeSummary } = useHomeSummary();
  const heat = summary?.heat;
  const { loggedIn } = useAuthSession();
  const { items: featuredEvents } = useFeaturedEvents();
  const nearestUpcoming = useNearestUpcomingForCountdown();
  const { data: unreadCount = 0 } = useNotificationUnreadCount();
  const {
    posts,
    isLoading: postsLoading,
    isError: postsError,
    refetch: refetchPosts,
  } = usePopularPosts();

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
      if (loggedIn && event.going) {
        openEventDetail(event);
        return;
      }
      joinActivityWithAuth(legacyId, {
        alreadyJoined: event.going,
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
      requireAuth(() => {
        void deletePostWithFeedback(post.id, {
          refetchOnFailure: () => refetchPosts(),
        });
      }, 'social');
    },
    [confirm, refetchPosts],
  );

  const activeTeamCount = heat?.people ?? 0;
  const navInsets = useNavBarInsets();

  return (
    <View data-cmp="Home" className="s-page-with-tabbar">
      <OverlayAwareScrollView
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

          {!postsLoading ? (
            <ThemedPageLoader variant="skeleton-feed" minHeight={240} />
          ) : postsError ? (
            <View
              className="s-home-feed s-home-feed--error"
              onClick={() => void refetchPosts()}
              role="button"
              aria-label="加载失败，点击重试"
            >
              <Text className="s-home-feed__error-text">帖子加载失败，点击重试</Text>
            </View>
          ) : (
            <HomeActivityFeed items={posts} onDelete={handleDeletePost} />
          )}

          <View className="s-home__heat s-tabbar-offset" aria-label="Today heat">
            {activeTeamCount} 人正在发现活动
          </View>
        </View>
      </OverlayAwareScrollView>

      {confirmDialog}
      <LoginInterceptHost />
    </View>
  );
};

export default Home;
