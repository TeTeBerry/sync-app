import './home.scss';
import { useDidShow } from '@tarojs/taro';
import { useCallback, useEffect, useMemo, useState } from 'react';
import ThemedPageLoader from '../../components/ThemedPageLoader';
import { HomeActivityFeed } from './components/HomeActivityFeed';
import { seedActivityDetailFromFeaturedEvent } from '../../utils/activityDetailCache';
import { preloadEventSubpackage } from '../../utils/subpackagePreload';
import { useConfirmDialog } from '../../hooks/useConfirmDialog';
import {
  useFeaturedEvents,
  useHomeSummary,
  useNotificationUnreadCount,
  usePopularPosts,
  useRegisteredActivityLegacyIds,
  mapHomeFeedPost,
} from '../../hooks/useSyncApi';
import { isActivityRegistered } from '../../utils/activityRegistration';
import { resolveFeaturedEventCountdown } from '../../utils/activityStatus';
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
import { PlatformDisclaimer } from '../../components/legal/PlatformDisclaimer';
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

  const {
    data: summary,
    isLoading: summaryQueryLoading,
    refetch: refetchHomeSummary,
  } = useHomeSummary();
  const summaryLoading = summaryQueryLoading && !summary;
  const heat = summary?.heat;
  const { items: featuredEvents } = useFeaturedEvents();
  const registeredLegacyIds = useRegisteredActivityLegacyIds();
  const [featuredIndex, setFeaturedIndex] = useState(0);
  const { data: unreadCount = 0 } = useNotificationUnreadCount();

  useEffect(() => {
    setFeaturedIndex(0);
  }, [featuredEvents]);

  const featuredCountdown = useMemo(() => {
    const event = featuredEvents[featuredIndex];
    if (!event) {
      return null;
    }
    return resolveFeaturedEventCountdown(event);
  }, [featuredEvents, featuredIndex]);

  const summaryPosts = useMemo(
    () => (summary?.popularPosts ?? []).map(mapHomeFeedPost),
    [summary?.popularPosts],
  );
  const {
    posts: feedPosts,
    isLoading: popularLoading,
    isError: postsError,
    refetch: refetchPosts,
  } = usePopularPosts();

  const posts = summaryPosts.length > 0 ? summaryPosts : feedPosts;
  const postsLoading = posts.length === 0 && (summaryLoading || popularLoading);

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
      if (isActivityRegistered(legacyId, registeredLegacyIds)) {
        openEventDetail(event);
        return;
      }
      joinActivityWithAuth(legacyId, {
        alreadyJoined: isActivityRegistered(legacyId, registeredLegacyIds),
        onSuccess: () => openEventDetail(event),
      });
    },
    [openEventDetail, registeredLegacyIds],
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
    <View data-cmp="Home" className="s-page-with-tabbar s-home--with-legal-footer">
      <View className="s-page-with-tabbar__main s-home__shell">
        <OverlayAwareScrollView
          scrollY
          enhanced
          showScrollbar={false}
          className="s-home__main s-scrollbar-none"
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
              eventName={featuredCountdown?.title}
              targetAt={featuredCountdown?.startAt ?? null}
            />

            <HomeFeaturedEvents
              items={featuredEvents}
              registeredLegacyIds={registeredLegacyIds}
              activeIndex={featuredIndex}
              onActiveIndexChange={setFeaturedIndex}
              onEventClick={openEventDetail}
              onJoinClick={handleJoinEvent}
              onEventPreload={handleEventPreload}
            />

            {postsLoading ? (
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

            <View className="s-home__heat" aria-label="Today heat">
              {activeTeamCount} 人正在发现活动
            </View>
          </View>
        </OverlayAwareScrollView>

        <PlatformDisclaimer variant="fixed" />
      </View>

      {confirmDialog}
      <LoginInterceptHost />
    </View>
  );
};

export default Home;
