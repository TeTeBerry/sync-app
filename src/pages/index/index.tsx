import './home.scss';
import { useDidShow } from '@tarojs/taro';
import { useCallback, useEffect, useMemo, useState } from 'react';
import { seedActivityDetailFromFeaturedEvent } from '../../utils/activityDetailCache';
import { preloadEventSubpackage } from '../../utils/subpackagePreload';
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
import { Text, View } from '@tarojs/components';

const Home = () => {
  useEndRouteTransitionOnShow();
  const navInsets = useNavBarInsets();

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

  const activeTeamCount = heat?.people ?? 0;

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

          <View className="s-home__heat s-tabbar-offset" aria-label="Today heat">
            {summaryLoading ? '…' : `${activeTeamCount} 人正在发现活动`}
          </View>
        </View>
      </OverlayAwareScrollView>

      <LoginInterceptHost />
    </View>
  );
};

export default Home;
