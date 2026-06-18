import './home.scss';
import { useDidShow } from '@tarojs/taro';
import { useCallback, useEffect, useMemo, useState } from 'react';
import { seedActivityDetailFromFeaturedEvent } from '../../utils/activityDetailCache';
import { prefetchEventPostsPage } from '../../cache/eventPostsPageCache';
import { preloadEventSubpackage } from '../../utils/subpackagePreload';
import { useConfirmDialog } from '../../hooks/useConfirmDialog';
import {
  useFeaturedEvents,
  useHomeSummary,
  useNotificationUnreadCount,
  useRegisteredActivityLegacyIds,
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
import { HomeCountdownCard } from './components/HomeCountdownCard';
import { HomeFeaturedEvents } from './components/HomeFeaturedEvents';
import { HomePersonalityTestEntry } from './components/HomePersonalityTestEntry';
import TabPageHeader from '../../components/navigation/TabPageHeader';
import { LoginInterceptHost } from '../../components/auth/LoginInterceptHost';
import { HomeHeaderActions } from './components/HomeHeaderActions';
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
  useEndRouteTransitionOnShow(ROUTES.HOME);
  const { confirm, confirmDialog } = useConfirmDialog({
    cancelText: '取消',
  });

  const { data: summary, refetch: refetchHomeSummary } = useHomeSummary();
  const heat = summary?.heat;
  const { items: featuredEvents } = useFeaturedEvents();
  const registeredLegacyIds = useRegisteredActivityLegacyIds();
  const [featuredIndex, setFeaturedIndex] = useState(0);
  const { data: unreadCount = 0, refetch: refetchUnreadCount } =
    useNotificationUnreadCount();

  useDidShow(() => {
    preloadHotRoutes(ROUTES.HOME);
    if (isLoggedIn()) {
      void refetchHomeSummary({ background: true });
      void refetchUnreadCount({ background: true });
    }
  });

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

  const handleNotification = useCallback(() => {
    requireAuth(() => goNotifications(), 'notification');
  }, []);

  const handleEventPreload = useCallback((event: FeaturedEvent) => {
    const legacyId = resolveFeaturedEventLegacyId(event);
    if (legacyId == null) {
      return;
    }
    seedActivityDetailFromFeaturedEvent(event);
    prefetchEventPostsPage(legacyId);
    preloadEventSubpackage();
    preloadPageSafe(ROUTES.EVENT_DETAIL, buildEventDetailQuery(legacyId));
  }, []);

  const openEventDetail = useCallback(
    (event: FeaturedEvent, options?: { focusPosts?: boolean }) => {
      const legacyId = resolveFeaturedEventLegacyId(event);
      if (legacyId == null) {
        return;
      }
      seedActivityDetailFromFeaturedEvent(event);
      goEventDetail(legacyId, options?.focusPosts ? { focusPosts: true } : undefined);
    },
    [],
  );

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
        confirm,
        onSuccess: () => openEventDetail(event, { focusPosts: true }),
      });
    },
    [confirm, openEventDetail, registeredLegacyIds],
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

            <HomePersonalityTestEntry />

            <View className="s-home-feed s-home-feed--muted">
              <Text className="s-home-feed__hint">
                报名活动后，可在活动详情查看或发布结伴帖
              </Text>
            </View>

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
