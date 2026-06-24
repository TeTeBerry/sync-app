import './events.scss';
import { useDidShow } from '@tarojs/taro';
import React, { useCallback, useMemo, useState } from 'react';
import { View, Text } from '@tarojs/components';
import { OverlayAwareScrollView } from '../../components/layout/OverlayAwareScrollView';
import { useT } from '@/hooks/useI18n';
import { useEndRouteTransitionOnShow } from '../../hooks/useEndRouteTransitionOnShow';
import { useNavBarInsets } from '../../hooks/useNavBarInsets';
import { useTabPageMainHeight } from '../../hooks/useTabPageMainHeight';
import ThemedPageLoader from '../../components/ThemedPageLoader';
import { seedActivityDetailFromEventCard } from '../../utils/activityDetailCache';
import { prefetchEventPostsPage } from '../../cache/eventPostsPageCache';
import { preloadEventSubpackage } from '../../utils/subpackagePreload';
import { buildEventDetailQuery, preloadPageSafe, ROUTES } from '../../utils/route';
import { useEventList, useHomeSummary } from '../../hooks/useSyncApi';
import { resolveEventCardLegacyId } from '../../utils/apiMappers';
import { goEventDetail, preloadHotRoutes } from '../../utils/route';
import { isLoggedIn } from '../../utils/authStorage';
import {
  STALE_ACTIVITIES_LIST_MS,
  STALE_HOME_SUMMARY_MS,
} from '../../constants/queryCache';
import { useStaleBackgroundRefetch } from '../../hooks/useStaleBackgroundRefetch';
import {
  activityOccursOnDay,
  filterActivitiesInCalendarMonth,
  todayCalendarParts,
} from '../../utils/activityCalendar';
import {
  getActivityStatusFromActivity,
  isRecentUpcomingActivity,
} from '../../utils/activityStatus';
import { EventsPageHeader } from './components/EventsPageHeader';
import type { EventsViewTab } from './components/EventsViewTabs';
import { EventsActivityCalendar } from './components/EventsActivityCalendar';
import { EventsActivityArtistsTab } from './components/EventsActivityArtistsTab';
import { ArtistProfileSheet } from '@/domains/lineup-artist';
import { LoginInterceptHost } from '../../components/auth/LoginInterceptHost';
import { EventsActivityList } from './components/EventsActivityList';
import { sortAllEventsByDate } from './utils/festivalEvents';
import { consumeEventsViewTabIntent } from '../../utils/eventsTabIntent';
import { consumeEventsSearchQuery } from '../../utils/eventsSearchIntent';
import { filterActivitiesForEventsSearch } from '../../utils/filterActivitiesForEventsSearch';
import { EventsCatalogToolbar } from './components/EventsCatalogToolbar';
import { EventsViewTabs } from './components/EventsViewTabs';
import { EventsHotCarousel } from './components/EventsHotCarousel';
import { EventsKnowledgeCard } from '@/domains/events-search/components/EventsKnowledgeCard';
import { useEventsKnowledgeSearch } from '@/domains/events-search/hooks/useEventsKnowledgeSearch';
import { useConfirmDialog } from '../../hooks/useConfirmDialog';
import { requestUnfollowActivityConfirm } from '../../utils/unfollowActivityConfirm';
import {
  filterActivitiesByRegion,
  filterActivitiesByTimeChip,
  HOT_CAROUSEL_MIN_COUNT,
  selectHotCatalogEvents,
  type EventsCatalogRegionFilter,
  type EventsCatalogTimeChip,
} from '../../utils/filterActivitiesForEventsCatalog';

/** Header + sticky view tabs only (px, design @ 375). Search/filters scroll with content. */
const EVENTS_CHROME_PX = 96;

const Events: React.FC = () => {
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
  const [searchQuery, setSearchQuery] = useState('');
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

  const knowledgeSearch = useEventsKnowledgeSearch(listPipelineEvents);

  React.useEffect(() => {
    const pending = pendingSearchIntentRef.current;
    if (!pending) return;
    pendingSearchIntentRef.current = null;
    knowledgeSearch.setMode('knowledge');
    knowledgeSearch.setQuery(pending);
  }, [knowledgeSearch.setMode, knowledgeSearch.setQuery]);

  const activeSearchQuery =
    knowledgeSearch.mode === 'knowledge' ? knowledgeSearch.query : searchQuery;
  const handleSearchQueryChange = useCallback(
    (value: string) => {
      if (knowledgeSearch.mode === 'knowledge') {
        knowledgeSearch.setQuery(value);
        return;
      }
      setSearchQuery(value);
    },
    [knowledgeSearch],
  );
  const handleSearchModeChange = useCallback(
    (mode: 'keyword' | 'knowledge') => {
      const currentValue =
        knowledgeSearch.mode === 'knowledge' ? knowledgeSearch.query : searchQuery;
      knowledgeSearch.setMode(mode);
      if (mode === 'knowledge') {
        knowledgeSearch.setQuery(currentValue);
        setSearchQuery('');
      } else {
        setSearchQuery(currentValue);
        knowledgeSearch.setQuery('');
      }
    },
    [knowledgeSearch, searchQuery],
  );

  const keywordFilteredEvents = useMemo(
    () => filterActivitiesForEventsSearch(listPipelineEvents, searchQuery),
    [listPipelineEvents, searchQuery],
  );

  const filteredListEvents = useMemo(() => {
    if (knowledgeSearch.mode !== 'knowledge' || !knowledgeSearch.query.trim()) {
      return keywordFilteredEvents;
    }
    if (knowledgeSearch.isSearching) {
      return [];
    }
    if (knowledgeSearch.usedLocalFallback) {
      return filterActivitiesForEventsSearch(listPipelineEvents, knowledgeSearch.query);
    }
    if (knowledgeSearch.filteredEvents != null) {
      return knowledgeSearch.filteredEvents;
    }
    return keywordFilteredEvents;
  }, [
    keywordFilteredEvents,
    knowledgeSearch.filteredEvents,
    knowledgeSearch.isSearching,
    knowledgeSearch.mode,
    knowledgeSearch.query,
    knowledgeSearch.usedLocalFallback,
    listPipelineEvents,
  ]);

  const hotCarouselEvents = useMemo(
    () => selectHotCatalogEvents(regionFilteredEvents),
    [regionFilteredEvents],
  );

  const listEmptyText = useMemo(() => {
    if (activeSearchQuery.trim()) {
      if (knowledgeSearch.mode === 'knowledge' && knowledgeSearch.isSearching) {
        return t('events.knowledge.searching');
      }
      return knowledgeSearch.mode === 'knowledge'
        ? t('events.knowledge.searchEmpty')
        : t('events.searchEmpty');
    }
    if (regionFilter !== 'all' || timeChip) {
      return t('events.catalogEmptyFiltered');
    }
    return t('events.catalogEmpty');
  }, [
    activeSearchQuery,
    knowledgeSearch.isSearching,
    knowledgeSearch.mode,
    regionFilter,
    t,
    timeChip,
  ]);

  const showKnowledgeCard =
    knowledgeSearch.mode === 'knowledge' && activeSearchQuery.trim().length > 0;

  const showHotCarousel =
    viewTab === 'list' &&
    !activeSearchQuery.trim() &&
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

  return (
    <View className="s-page-shell s-page-with-tabbar">
      <View className="s-page-with-tabbar__main s-events">
        <EventsPageHeader navInsets={navInsets} upcomingCount={recentUpcomingCount} />
        <View className="s-events__sticky-tabs">
          <EventsViewTabs activeTab={viewTab} onChange={handleViewTabChange} />
        </View>

        {viewTab === 'artists' ? (
          <EventsActivityArtistsTab
            listHeight={listScrollHeight ?? undefined}
            onOpenArtist={setSelectedArtistId}
          />
        ) : (
          <OverlayAwareScrollView
            scrollY
            enhanced
            showScrollbar={false}
            className="s-events__main s-scrollbar-none"
            style={
              listScrollHeight != null ? { height: `${listScrollHeight}px` } : undefined
            }
          >
            <View className="s-events__scroll-inner">
              {isLoading ? (
                <ThemedPageLoader variant="skeleton-feed" minHeight={280} />
              ) : (
                <>
                  <EventsCatalogToolbar
                    viewTab={viewTab}
                    searchQuery={activeSearchQuery}
                    onSearchChange={handleSearchQueryChange}
                    searchMode={knowledgeSearch.mode}
                    onSearchModeChange={handleSearchModeChange}
                    region={regionFilter}
                    timeChip={timeChip}
                    onRegionChange={setRegionFilter}
                    onTimeChipChange={setTimeChip}
                  />
                  {viewTab === 'list' ? (
                    <>
                      {showKnowledgeCard ? (
                        <EventsKnowledgeCard
                          card={
                            knowledgeSearch.knowledgeCard ?? {
                              title: t('events.knowledge.fallbackTitle'),
                              sections: [
                                {
                                  body: knowledgeSearch.isSearching
                                    ? t('events.knowledge.loading')
                                    : t('events.knowledge.fallbackBody'),
                                },
                              ],
                              sources: [t('events.knowledge.fallbackSource')],
                              aiGenerated: false,
                            }
                          }
                          parsedInsight={knowledgeSearch.parsedInsight}
                          isLoading={
                            knowledgeSearch.isSearching &&
                            !knowledgeSearch.knowledgeCard
                          }
                        />
                      ) : null}
                      {showHotCarousel ? (
                        <EventsHotCarousel
                          events={hotCarouselEvents}
                          onOpenDetail={openDetail}
                          onWarmDetail={warmEventDetail}
                        />
                      ) : null}
                      <View className="s-events__section-head s-events__section-head--list">
                        <Text className="s-events__section-title">
                          {t('events.allActivities')}
                        </Text>
                      </View>
                      <EventsActivityList
                        events={filteredListEvents}
                        isError={isError}
                        emptyText={listEmptyText}
                        onRetry={() => void refetch()}
                        onOpenDetail={openDetail}
                        onWarmDetail={warmEventDetail}
                        onConfirmUnfollow={confirmUnfollow}
                      />
                    </>
                  ) : (
                    <>
                      <EventsActivityCalendar
                        activities={calendarCatalogEvents}
                        year={calendarMonth.year}
                        month={calendarMonth.month}
                        selected={selectedDay}
                        onMonthChange={handleMonthChange}
                        onSelectDay={handleSelectDay}
                      />

                      <View className="s-events__section-head">
                        <Text className="s-events__section-title">
                          {calendarSectionTitle}
                        </Text>
                      </View>

                      <EventsActivityList
                        events={calendarListEvents}
                        isError={isError}
                        emptyText={calendarEmptyText}
                        onRetry={() => void refetch()}
                        onOpenDetail={openDetail}
                        onWarmDetail={warmEventDetail}
                        onConfirmUnfollow={confirmUnfollow}
                      />
                    </>
                  )}
                </>
              )}
            </View>
          </OverlayAwareScrollView>
        )}
      </View>
      <ArtistProfileSheet
        open={selectedArtistId != null}
        artistId={selectedArtistId}
        onClose={() => setSelectedArtistId(null)}
        reserveTabBarSpace
      />
      <LoginInterceptHost />
      {confirmDialog}
    </View>
  );
};

export default Events;
