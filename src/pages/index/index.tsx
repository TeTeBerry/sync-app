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
  useProfileActivitiesQuery,
} from '../../hooks/useSyncApi';
import { hydrateActivitySubscriptionStore } from '@/stores/activitySubscriptionActions';
import { useActivitySubscriptionStore } from '@/stores/activitySubscriptionStore';
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
import { pickNextRegisteredEventForUser } from './utils/pickNextRegisteredEvent';
import {
  buildFeaturedEventsKey,
  resolveFeaturedIndexAfterListChange,
} from './utils/homeFeaturedIndex';
import { resolveHomeFindTeamActivityId } from './utils/resolveHomeActivityId';
import { useHomeFestivalPlanNavigation } from '@/domains/festival-plan';
import {
  countPlurrResponsibilityChecked,
  loadPlurrResponsibility,
} from '@/utils/plurResponsibility.storage';
import { getActiveActivityLegacyId } from '@/domains/activity-scope';
import { useNavBarInsets } from '../../hooks/useNavBarInsets';
import { useEndRouteTransitionOnShow } from '../../hooks/useEndRouteTransitionOnShow';
import { OverlayAwareScrollView } from '../../components/layout/OverlayAwareScrollView';
import { PlatformDisclaimer } from '../../components/legal/PlatformDisclaimer';
import { NewUserOnboardingSheet } from '../../components/onboarding/NewUserOnboardingSheet';
import { PlurEntrySheet } from '@/components/plur/PlurEntrySheet';
import { useFirstRunOrchestrator } from '../../hooks/useFirstRunOrchestrator';
import { goPlurCulture, goPlurFilmFromEntry } from '@/utils/plurRoute';
import { useNewUserOnboarding } from '../../hooks/useNewUserOnboarding';
import { useT } from '@/hooks/useI18n';
import { View } from '@tarojs/components';

const Home = () => {
  useEndRouteTransitionOnShow(ROUTES.HOME);
  const t = useT();

  const { data: summary, refetch: refetchHomeSummary } = useHomeSummary();
  const { loggedIn } = useAuthSession();
  const { data: profileActivities, refetch: refetchProfileActivities } =
    useProfileActivitiesQuery({ enabled: loggedIn });
  const subscriptionHydrated = useActivitySubscriptionStore((state) => state.hydrated);
  const registeredLegacyIds = useActivitySubscriptionStore(
    (state) => state.registeredLegacyIds,
  );
  const watchLineupGoals = useActivitySubscriptionStore(
    (state) => state.watchLineupGoals,
  );
  const heat = summary?.heat;
  const {
    items: featuredEvents,
    isLoading: featuredLoading,
    isError: featuredError,
    refetch: refetchFeaturedEvents,
  } = useFeaturedEvents();
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

  const [plurrRefreshTick, setPlurrRefreshTick] = useState(0);

  useDidShow(() => {
    preloadHotRoutes(ROUTES.HOME);
    setPlurrRefreshTick((tick) => tick + 1);
    if (loggedIn) {
      void hydrateActivitySubscriptionStore();
      void refetchProfileActivities({ background: true });
    }
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

  const featuredEvent = featuredEvents[featuredIndex] ?? null;

  const featuredLegacyId = useMemo(() => {
    if (!featuredEvent) {
      return undefined;
    }
    return resolveFeaturedEventLegacyId(featuredEvent) ?? undefined;
  }, [featuredEvent]);

  const handleNextFeaturedEvent = useCallback(() => {
    if (featuredEvents.length <= 1) {
      return;
    }
    setFeaturedIndex((prev) => (prev + 1) % featuredEvents.length);
  }, [featuredEvents.length]);

  const {
    plurEntryOpen,
    onboardingOpen,
    highlightStepIndex,
    setOnboardingOpen,
    dismissPlurEntry,
    completePlurEntryWithoutL2,
  } = useFirstRunOrchestrator();

  const handlePlurWatchFilm = useCallback(() => {
    completePlurEntryWithoutL2();
    goPlurFilmFromEntry({
      from: 'first_visit',
      activityLegacyId: featuredLegacyId,
    });
  }, [completePlurEntryWithoutL2, featuredLegacyId]);

  const handlePlurLearnMore = useCallback(() => {
    completePlurEntryWithoutL2();
    goPlurCulture();
  }, [completePlurEntryWithoutL2]);

  const { onboardingSteps, dismissOnboarding } = useNewUserOnboarding({
    featuredEvent,
    open: onboardingOpen,
    onOpenChange: setOnboardingOpen,
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
    () =>
      loggedIn
        ? pickNextRegisteredEventForUser(summary?.signupEvents, {
            registeredLegacyIds: subscriptionHydrated ? registeredLegacyIds : undefined,
            profileActivities: subscriptionHydrated ? undefined : profileActivities,
          })
        : null,
    [
      loggedIn,
      summary?.signupEvents,
      subscriptionHydrated,
      registeredLegacyIds,
      profileActivities,
    ],
  );

  const homeGoals = useMemo(() => {
    if (!nextSelectedEvent?.id) {
      return undefined;
    }
    const goals = watchLineupGoals.filter(
      (goal) => goal.activityLegacyId === nextSelectedEvent.id,
    );
    if (!goals.length) {
      return undefined;
    }
    return goals.map((goal) => ({ id: goal.goalId, kind: 'watch_lineup' as const }));
  }, [nextSelectedEvent?.id, watchLineupGoals]);

  const homeFestivalPlan = useHomeFestivalPlanNavigation(nextSelectedEvent?.id);
  const plurrCheckedCount = useMemo(() => {
    const activityLegacyId = nextSelectedEvent?.id;
    if (activityLegacyId == null || activityLegacyId <= 0) {
      return 0;
    }
    return countPlurrResponsibilityChecked(loadPlurrResponsibility(activityLegacyId));
  }, [nextSelectedEvent?.id, plurrRefreshTick]);

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
          style={{ flex: 1, height: 0, minHeight: 0 }}
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
                goals={homeGoals}
                onViewDetail={handleNextEventView}
                onOpenPosts={handleNextEventPosts}
                onOpenPostReplies={
                  summary?.myNextEventPostEngagement?.unreadReplyCount
                    ? handleNextEventPostReplies
                    : undefined
                }
                onFestivalPlanPress={homeFestivalPlan.openFestivalPlanHub}
                onNextTaskPress={homeFestivalPlan.onTaskPress}
                plurrCheckedCount={plurrCheckedCount}
              />
            ) : null}

            <HomeCountdownCard
              eventName={featuredCountdown?.title}
              targetAt={featuredCountdown?.startAt ?? null}
            />

            <HomeFeaturedEvents
              items={featuredEvents}
              isLoading={featuredLoading}
              isError={featuredError}
              onRetry={() => void refetchFeaturedEvents()}
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

      <PlurEntrySheet
        open={plurEntryOpen}
        onSkip={dismissPlurEntry}
        onWatchFilm={handlePlurWatchFilm}
        onLearnMore={handlePlurLearnMore}
      />

      <NewUserOnboardingSheet
        open={onboardingOpen}
        steps={onboardingSteps}
        featuredEvent={featuredEvent}
        featuredEventCount={featuredEvents.length}
        highlightStepIndex={highlightStepIndex}
        onNextFeaturedEvent={handleNextFeaturedEvent}
        onDismiss={dismissOnboarding}
      />
      <LoginInterceptHost />
    </View>
  );
};

export default Home;
