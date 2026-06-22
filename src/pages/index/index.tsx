import './home.scss';
import { useDidShow } from '@tarojs/taro';
import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { seedActivityDetailFromFeaturedEvent } from '../../utils/activityDetailCache';
import { prefetchEventPostsPage } from '../../cache/eventPostsPageCache';
import { preloadEventSubpackage } from '../../utils/subpackagePreload';
import {
  useFeaturedEvents,
  useHomeSummary,
  useNotificationUnreadCount,
} from '../../hooks/useSyncApi';
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
import { isLoggedIn } from '../../utils/authStorage';
import { resolveRequestUserId } from '../../api/requestContext';
import { notificationUnreadQueryKey } from '../../cache/notificationCache';
import { STALE_HOME_SUMMARY_MS } from '../../constants/queryCache';
import { useStaleBackgroundRefetch } from '../../hooks/useStaleBackgroundRefetch';
import { HomeCountdownCard } from './components/HomeCountdownCard';
import { HomeFeaturedEvents } from './components/HomeFeaturedEvents';
import { HomePersonalityTestEntry } from './components/HomePersonalityTestEntry';
import { HomeMyNextEvent } from './components/HomeMyNextEvent';
import { HomeAiEntry } from './components/HomeAiEntry';
import { HomeQuickActions } from './components/HomeQuickActions';
import TabPageHeader from '../../components/navigation/TabPageHeader';
import { LoginInterceptHost } from '../../components/auth/LoginInterceptHost';
import { HomeHeaderActions } from './components/HomeHeaderActions';
import {
  resolveFeaturedEventLegacyId,
  type FeaturedEvent,
} from '../../utils/apiMappers';
import { useAuthSession } from '../../hooks/useAuthSession';
import { seedActivityDetailFromHomeSignupEvent } from '../../utils/activityDetailCache';
import { pickNextRegisteredEvent } from './utils/pickNextRegisteredEvent';
import {
  buildFeaturedEventsKey,
  resolveFeaturedIndexAfterListChange,
} from './utils/homeFeaturedIndex';
import { resolveHomeFindTeamActivityId } from './utils/resolveHomeActivityId';
import { useHomeFestivalPlanNavigation } from '@/domains/festival-plan/hooks/useHomeFestivalPlanNavigation';
import { getActiveActivityLegacyId } from '@/domains/activity-scope';
import { useNavBarInsets } from '../../hooks/useNavBarInsets';
import { useEndRouteTransitionOnShow } from '../../hooks/useEndRouteTransitionOnShow';
import { OverlayAwareScrollView } from '../../components/layout/OverlayAwareScrollView';
import { PlatformDisclaimer } from '../../components/legal/PlatformDisclaimer';
import { NewUserOnboardingSheet } from '../../components/onboarding/NewUserOnboardingSheet';
import { useNewUserOnboarding } from '../../hooks/useNewUserOnboarding';
import { useT } from '@/hooks/useI18n';
import { View } from '@tarojs/components';

const Home = () => {
  useEndRouteTransitionOnShow(ROUTES.HOME);
  const t = useT();

  const { data: summary, refetch: refetchHomeSummary } = useHomeSummary();
  const heat = summary?.heat;
  const { items: featuredEvents } = useFeaturedEvents();
  const { loggedIn } = useAuthSession();
  const [featuredIndex, setFeaturedIndex] = useState(0);
  const { data: unreadCount = 0, refetch: refetchUnreadCount } =
    useNotificationUnreadCount();

  useStaleBackgroundRefetch({
    refetch: refetchHomeSummary,
    queryKey: ['home', 'summary'],
    staleTime: STALE_HOME_SUMMARY_MS,
    enabled: isLoggedIn(),
  });
  useStaleBackgroundRefetch({
    refetch: refetchUnreadCount,
    queryKey: [...notificationUnreadQueryKey(resolveRequestUserId())],
    staleTime: 30_000,
    enabled: isLoggedIn(),
  });

  useDidShow(() => {
    preloadHotRoutes(ROUTES.HOME);
  });

  const featuredEventsKey = useMemo(
    () => buildFeaturedEventsKey(featuredEvents),
    [featuredEvents],
  );
  const featuredEventsKeyRef = useRef(featuredEventsKey);

  useEffect(() => {
    const prevKey = featuredEventsKeyRef.current;
    featuredEventsKeyRef.current = featuredEventsKey;
    setFeaturedIndex((prev) =>
      resolveFeaturedIndexAfterListChange(
        prev,
        prevKey,
        featuredEventsKey,
        featuredEvents.length,
      ),
    );
  }, [featuredEventsKey, featuredEvents.length]);

  const featuredCountdown = useMemo(() => {
    const event = featuredEvents[featuredIndex];
    if (!event) {
      return null;
    }
    return resolveFeaturedEventCountdown(event);
  }, [featuredEvents, featuredIndex]);

  const featuredLegacyId = useMemo(() => {
    const event = featuredEvents[featuredIndex];
    if (!event) return undefined;
    return resolveFeaturedEventLegacyId(event) ?? undefined;
  }, [featuredEvents, featuredIndex]);

  const { onboardingOpen, onboardingSteps, dismissOnboarding } = useNewUserOnboarding({
    featuredActivityLegacyId: featuredLegacyId,
  });

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

  const activeTeamCount = heat?.people ?? 0;
  const navInsets = useNavBarInsets();

  const nextSelectedEvent = useMemo(
    () => (loggedIn ? pickNextRegisteredEvent(summary?.signupEvents) : null),
    [loggedIn, summary?.signupEvents],
  );

  const homeFestivalPlan = useHomeFestivalPlanNavigation(nextSelectedEvent?.id);

  const openHomeActivity = useCallback(
    (
      legacyId: number,
      options?: {
        focusPosts?: boolean;
        openBuddyPost?: boolean;
        postId?: string;
        openComments?: boolean;
      },
    ) => {
      const signupEvent = summary?.signupEvents.find((event) => event.id === legacyId);
      if (signupEvent) {
        seedActivityDetailFromHomeSignupEvent(signupEvent);
      }
      goEventDetail(
        legacyId,
        options?.openBuddyPost
          ? { openBuddyPost: true }
          : options?.postId
            ? {
                postId: options.postId,
                focusPosts: options.focusPosts ?? true,
                openComments: options.openComments ?? true,
              }
            : options?.focusPosts
              ? { focusPosts: true }
              : undefined,
      );
    },
    [summary?.signupEvents],
  );

  const handleNextEventView = useCallback(() => {
    if (!nextSelectedEvent) {
      return;
    }
    openHomeActivity(nextSelectedEvent.id);
  }, [nextSelectedEvent, openHomeActivity]);

  const handleNextEventPosts = useCallback(() => {
    if (!nextSelectedEvent) {
      return;
    }
    openHomeActivity(nextSelectedEvent.id, { openBuddyPost: true });
  }, [nextSelectedEvent, openHomeActivity]);

  const handleNextEventPostReplies = useCallback(() => {
    const engagement = summary?.myNextEventPostEngagement;
    if (!nextSelectedEvent || !engagement?.postId) {
      return;
    }
    openHomeActivity(nextSelectedEvent.id, {
      postId: engagement.postId,
      focusPosts: true,
      openComments: true,
    });
  }, [nextSelectedEvent, openHomeActivity, summary?.myNextEventPostEngagement]);

  const homeFindTeamActivityId = useMemo(
    () =>
      resolveHomeFindTeamActivityId({
        activeActivityLegacyId: getActiveActivityLegacyId(),
        nextSelectedEventId: nextSelectedEvent?.id,
        featuredLegacyId,
      }),
    [nextSelectedEvent?.id, featuredLegacyId],
  );

  const heatLabel =
    activeTeamCount > 0
      ? t('home.heatActive', { count: activeTeamCount })
      : t('home.heatIdle');

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
              brandSubtitle={t('home.brandSubtitle')}
              navInsets={navInsets}
              paddingRightGutterPx={16}
              trailing={
                <HomeHeaderActions
                  unreadCount={unreadCount}
                  onNotificationClick={handleNotification}
                />
              }
            />

            {nextSelectedEvent ? (
              <HomeMyNextEvent
                event={nextSelectedEvent}
                postEngagement={summary?.myNextEventPostEngagement ?? undefined}
                festivalPlan={homeFestivalPlan.checklist}
                onViewDetail={handleNextEventView}
                onOpenPosts={handleNextEventPosts}
                onOpenPostReplies={
                  summary?.myNextEventPostEngagement?.unreadReplyCount
                    ? handleNextEventPostReplies
                    : undefined
                }
                onFestivalPlanPress={homeFestivalPlan.openFestivalPlanHub}
                onNextTaskPress={homeFestivalPlan.onTaskPress}
              />
            ) : null}

            <HomeCountdownCard
              eventName={featuredCountdown?.title}
              targetAt={featuredCountdown?.startAt ?? null}
            />

            <HomeFeaturedEvents
              items={featuredEvents}
              activeIndex={featuredIndex}
              onActiveIndexChange={setFeaturedIndex}
              onEventClick={openEventDetail}
              onEventPreload={handleEventPreload}
            />

            <HomePersonalityTestEntry />

            <HomeAiEntry findTeamActivityId={homeFindTeamActivityId} />

            <HomeQuickActions />

            <View className="s-home__heat" aria-label={t('home.countdownAria')}>
              {heatLabel}
            </View>
          </View>
        </OverlayAwareScrollView>

        <PlatformDisclaimer variant="fixed" />
      </View>

      <NewUserOnboardingSheet
        open={onboardingOpen}
        steps={onboardingSteps}
        onDismiss={dismissOnboarding}
      />
      <LoginInterceptHost />
    </View>
  );
};

export default Home;
