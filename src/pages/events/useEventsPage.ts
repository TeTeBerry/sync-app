import { useDidShow } from '@tarojs/taro';
import React, { useCallback, useMemo, useState } from 'react';
import { useT } from '@/hooks/useI18n';
import { useEndRouteTransitionOnShow } from '@/hooks/useEndRouteTransitionOnShow';
import { useNavBarInsets } from '@/hooks/useNavBarInsets';
import { useTabPageMainHeight } from '@/hooks/useTabPageMainHeight';
import { seedActivityDetailFromEventCard } from '@/utils/activityDetailCache';
import { prefetchEventPostsPage } from '@/cache/eventPostsPageCache';
import { preloadEventSubpackage } from '@/utils/subpackagePreload';
import {
  buildEventDetailQuery,
  goEventDetail,
  preloadHotRoutes,
  preloadPageSafe,
  ROUTES,
} from '@/utils/route';
import { useEventList, useHomeSummary } from '@/hooks/useSyncApi';
import { resolveEventCardLegacyId } from '@/utils/apiMappers';
import { isLoggedIn } from '@/utils/authStorage';
import {
  STALE_ACTIVITIES_LIST_MS,
  STALE_HOME_SUMMARY_MS,
} from '@/constants/queryCache';
import { useStaleBackgroundRefetch } from '@/hooks/useStaleBackgroundRefetch';
import {
  activityOccursOnDay,
  filterActivitiesInCalendarMonth,
  todayCalendarParts,
} from '@/utils/activityCalendar';
import {
  getActivityStatusFromActivity,
  isRecentUpcomingActivity,
} from '@/utils/activityStatus';
import type { EventsViewTab } from './components/EventsViewTabs';
import { sortAllEventsByDate } from './utils/festivalEvents';
import { consumeEventsViewTabIntent } from '@/utils/eventsTabIntent';
import { consumeEventsSearchQuery } from '@/utils/eventsSearchIntent';
import { useEventsSearch } from '@/domains/events-search';
import { useConfirmDialog } from '@/hooks/useConfirmDialog';
import { requestUnfollowActivityConfirm } from '@/utils/unfollowActivityConfirm';
import {
  filterActivitiesByRegion,
  filterActivitiesByTimeChip,
  HOT_CAROUSEL_MIN_COUNT,
  selectRecentAsianCatalogEvents,
  type EventsCatalogRegionFilter,
  type EventsCatalogTimeChip,
} from '@/utils/filterActivitiesForEventsCatalog';

/** Header + sticky view tabs only (px, design @ 375). Search/filters scroll with content. */
const EVENTS_CHROME_PX = 96;

export function useEventsPage() {
  useEndRouteTransitionOnShow(ROUTES.EVENTS);
  const t = useT();

  const navInsets = useNavBarInsets();
  const { confirm, confirmDialog } = useConfirmDialog({
    cancelText: t('common.cancel'),
  });
  const listScrollHeight = useTabPageMainHeight(
    EVENTS_CHROME_PX + navInsets.paddingTop,
  );

  const { events, isLoading, isError, refetch } = useEventList();
  const { refetch: refetchHomeSummary } = useHomeSummary();
  const [viewTab, setViewTab] = useState<EventsViewTab>('list');
  const [selectedDay, setSelectedDay] = useState<{
    year: number;
    month: number;
    day: number;
  } | null>(null);
  const pendingSearchIntentRef = React.useRef<string | null>(null);
  const [regionFilter, setRegionFilter] = useState<EventsCatalogRegionFilter>('all');
  const [timeChip, setTimeChip] = useState<EventsCatalogTimeChip | null>(null);
  const [selectedArtistId, setSelectedArtistId] = useState<string | null>(null);
  const [calendarMonth, setCalendarMonth] = useState(() => {
    const today = todayCalendarParts();
    return { year: today.year, month: today.month };
  });

  const resetCalendarToCurrentMonth = useCallback(() => {
    const today = todayCalendarParts();
    setCalendarMonth({ year: today.year, month: today.month });
    setSelectedDay(null);
  }, []);

  const handleViewTabChange = useCallback(
    (tab: EventsViewTab) => {
      setViewTab(tab);
      if (tab === 'calendar') {
        resetCalendarToCurrentMonth();
      }
    },
    [resetCalendarToCurrentMonth],
  );

  useStaleBackgroundRefetch({
    refetch: refetchHomeSummary,
    queryKey: ['home', 'summary'],
    staleTime: STALE_HOME_SUMMARY_MS,
    enabled: isLoggedIn(),
  });
  useStaleBackgroundRefetch({
    refetch,
    queryKey: ['activities'],
    staleTime: STALE_ACTIVITIES_LIST_MS,
    enabled: isLoggedIn(),
  });

  useDidShow(() => {
    preloadHotRoutes(ROUTES.EVENTS);
    const tabIntent = consumeEventsViewTabIntent();
    if (tabIntent) {
      setViewTab(tabIntent);
      if (tabIntent === 'calendar') {
        resetCalendarToCurrentMonth();
      }
    }
    const searchIntent = consumeEventsSearchQuery();
    if (searchIntent != null) {
      pendingSearchIntentRef.current = searchIntent;
      setViewTab('list');
    }
  });

  const upcomingEvents = useMemo(
    () =>
      events.filter(
        (event) => getActivityStatusFromActivity(event.date, event.title) !== 'ended',
      ),
    [events],
  );

  const recentUpcomingCount = useMemo(
    () => events.filter((event) => isRecentUpcomingActivity(event)).length,
    [events],
  );

  const warmEventDetail = useCallback((event: (typeof events)[number]) => {
    seedActivityDetailFromEventCard(event);
    const id = resolveEventCardLegacyId(event.id);
    if (id == null) {
      return;
    }
    prefetchEventPostsPage(id);
    preloadEventSubpackage();
    preloadPageSafe(ROUTES.EVENT_DETAIL, buildEventDetailQuery(id));
  }, []);

  const openDetail = useCallback(
    (legacyId: string) => {
      const id = resolveEventCardLegacyId(legacyId);
      if (id == null) {
        return;
      }
      const event = events.find((item) => item.id === legacyId);
      if (event) {
        warmEventDetail(event);
      }
      goEventDetail(id);
    },
    [events, warmEventDetail],
  );

  const regionFilteredEvents = useMemo(
    () => filterActivitiesByRegion(upcomingEvents, regionFilter),
    [regionFilter, upcomingEvents],
  );

  const listPipelineEvents = useMemo(() => {
    const sorted = sortAllEventsByDate(regionFilteredEvents);
    return filterActivitiesByTimeChip(sorted, timeChip);
  }, [regionFilteredEvents, timeChip]);

  const eventsSearch = useEventsSearch(listPipelineEvents);

  React.useEffect(() => {
    const pending = pendingSearchIntentRef.current;
    if (!pending) return;
    pendingSearchIntentRef.current = null;
    eventsSearch.setQuery(pending);
  }, [eventsSearch.setQuery]);

  const filteredListEvents = useMemo(() => {
    if (eventsSearch.filteredEvents != null) {
      return eventsSearch.filteredEvents;
    }
    return listPipelineEvents;
  }, [eventsSearch.filteredEvents, listPipelineEvents]);

  const hotCarouselEvents = useMemo(
    () => selectRecentAsianCatalogEvents(regionFilteredEvents),
    [regionFilteredEvents],
  );

  const listEmptyText = useMemo(() => {
    if (eventsSearch.isActive) {
      if (eventsSearch.isAiSearchActive && eventsSearch.isSearching) {
        return t('events.knowledge.searching');
      }
      return eventsSearch.isAiSearchActive
        ? t('events.knowledge.searchEmpty')
        : t('events.searchEmpty');
    }
    if (regionFilter !== 'all' || timeChip) {
      return t('events.catalogEmptyFiltered');
    }
    return t('events.catalogEmpty');
  }, [
    eventsSearch.isActive,
    eventsSearch.isAiSearchActive,
    eventsSearch.isSearching,
    regionFilter,
    t,
    timeChip,
  ]);

  const knowledgeCardFallback = useMemo(
    () => ({
      title: t('events.knowledge.fallbackTitle'),
      sections: [{ body: t('events.knowledge.fallbackBody') }],
      sources: [t('events.knowledge.fallbackSource')],
      aiGenerated: false as const,
    }),
    [t],
  );

  const showKnowledgeCard = eventsSearch.isAiSearchActive;

  const showHotCarousel =
    viewTab === 'list' &&
    !eventsSearch.isActive &&
    hotCarouselEvents.length >= HOT_CAROUSEL_MIN_COUNT;

  const calendarCatalogEvents = useMemo(
    () => sortAllEventsByDate(filterActivitiesByRegion(events, regionFilter)),
    [events, regionFilter],
  );

  const calendarListEvents = useMemo(() => {
    if (selectedDay) {
      return calendarCatalogEvents.filter((event) =>
        activityOccursOnDay(
          event,
          selectedDay.year,
          selectedDay.month,
          selectedDay.day,
        ),
      );
    }
    return filterActivitiesInCalendarMonth(
      calendarCatalogEvents,
      calendarMonth.year,
      calendarMonth.month,
    );
  }, [calendarCatalogEvents, calendarMonth.month, calendarMonth.year, selectedDay]);

  const calendarSectionTitle = useMemo(() => {
    if (selectedDay) {
      return t('events.calendarDayTitle', {
        month: selectedDay.month,
        day: selectedDay.day,
      });
    }
    return t('events.calendarMonthTitle', {
      year: calendarMonth.year,
      month: calendarMonth.month,
    });
  }, [calendarMonth.month, calendarMonth.year, selectedDay, t]);

  const calendarEmptyText = useMemo(() => {
    if (regionFilter !== 'all') {
      return t('events.catalogEmptyFiltered');
    }
    if (selectedDay) {
      return t('events.calendarEmptyDay');
    }
    return t('events.calendarEmptyMonth');
  }, [regionFilter, selectedDay, t]);

  const handleMonthChange = useCallback((year: number, month: number) => {
    setCalendarMonth({ year, month });
    setSelectedDay(null);
  }, []);

  const handleSelectDay = useCallback((year: number, month: number, day: number) => {
    setSelectedDay({ year, month, day });
    setCalendarMonth({ year, month });
  }, []);

  const confirmUnfollow = useCallback(
    (title: string) => requestUnfollowActivityConfirm(confirm, title),
    [confirm],
  );

  return {
    navInsets,
    listScrollHeight,
    viewTab,
    handleViewTabChange,
    recentUpcomingCount,
    isLoading,
    isError,
    refetch,
    eventsSearch,
    regionFilter,
    setRegionFilter,
    timeChip,
    setTimeChip,
    listTab: {
      filteredListEvents,
      listEmptyText,
      showKnowledgeCard,
      knowledgeCardFallback,
      showHotCarousel,
      hotCarouselEvents,
      openDetail,
      warmEventDetail,
      confirmUnfollow,
    },
    calendarTab: {
      calendarCatalogEvents,
      calendarMonth,
      selectedDay,
      calendarListEvents,
      calendarSectionTitle,
      calendarEmptyText,
      handleMonthChange,
      handleSelectDay,
      openDetail,
      warmEventDetail,
      confirmUnfollow,
    },
    artistsTab: {
      listScrollHeight,
      onOpenArtist: setSelectedArtistId,
    },
    overlays: {
      selectedArtistId,
      setSelectedArtistId,
      confirmDialog,
    },
  };
}
