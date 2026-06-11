import './events.scss';
import { useDidShow } from '@tarojs/taro';
import React, { useCallback, useEffect, useMemo, useState } from 'react';
import { View, Text, ScrollView } from '@tarojs/components';
import { useEndRouteTransitionOnShow } from '../../hooks/useEndRouteTransitionOnShow';
import { useNavBarInsets } from '../../hooks/useNavBarInsets';
import { useTabPageMainHeight } from '../../hooks/useTabPageMainHeight';
import ThemedPageLoader from '../../components/ThemedPageLoader';
import { seedActivityDetailFromEventCard } from '../../utils/activityDetailCache';
import { preloadEventSubpackage } from '../../utils/subpackagePreload';
import { buildEventDetailQuery, preloadPageSafe, ROUTES } from '../../utils/route';
import { useEventList, useHomeSummary } from '../../hooks/useSyncApi';
import { parseActivityLegacyId } from '../../utils/activityLegacyId';
import { resolveEventCardLegacyId } from '../../utils/apiMappers';
import { goEventDetail, preloadHotRoutes } from '../../utils/route';
import { activityOccursOnDay, todayCalendarParts } from '../../utils/activityCalendar';
import {
  compareActivitiesNearestFirst,
  extractYearFromText,
  getActivityStatusFromActivity,
  parseActivityDateRange,
} from '../../utils/activityStatus';
import { EventsPageHeader } from './components/EventsPageHeader';
import GlobalAiAgentFab from '../../components/navigation/GlobalAiAgentFab';
import { EventsViewTabs, type EventsViewTab } from './components/EventsViewTabs';
import { EventsActivityCalendar } from './components/EventsActivityCalendar';
import { EventsActivityMapTab } from './components/EventsActivityMapTab';
import { EventsActivityList } from './components/EventsActivityList';
import {
  isFestivalEvent,
  sortAllEventsByDate,
  sortFestivalEventsByDate,
} from './utils/festivalEvents';
import { consumeEventsViewTabIntent } from '../../utils/eventsTabIntent';

/** Header + view tabs (px, design @ 375). */
const EVENTS_CHROME_PX = 118;

const Events: React.FC = () => {
  useEndRouteTransitionOnShow();

  const navInsets = useNavBarInsets();
  const listScrollHeight = useTabPageMainHeight(
    EVENTS_CHROME_PX + navInsets.paddingTop,
  );

  const { events, isLoading, isError, refetch } = useEventList();
  const { data: homeSummary } = useHomeSummary();
  const [viewTab, setViewTab] = useState<EventsViewTab>('calendar');
  const [selectedDay, setSelectedDay] = useState(todayCalendarParts);

  useDidShow(() => {
    preloadHotRoutes(ROUTES.EVENTS);
    const intent = consumeEventsViewTabIntent();
    if (intent) {
      setViewTab(intent);
    }
  });

  const registeredLegacyIds = useMemo(() => {
    const ids = new Set<number>();
    for (const item of homeSummary?.signupEvents ?? []) {
      if (item.going) {
        const legacyId = parseActivityLegacyId(item.id);
        if (legacyId != null) {
          ids.add(legacyId);
        }
      }
    }
    return ids;
  }, [homeSummary?.signupEvents]);

  const upcomingEvents = useMemo(
    () =>
      events.filter(
        (event) => getActivityStatusFromActivity(event.date, event.title) !== 'ended',
      ),
    [events],
  );

  const initialMonth = useMemo(() => {
    const sorted = [...upcomingEvents].sort(compareActivitiesNearestFirst);
    const first = sorted[0];
    if (!first) return todayCalendarParts();
    const yearHint =
      extractYearFromText(first.title) ?? String(new Date().getFullYear());
    const range = parseActivityDateRange(first.date, yearHint);
    if (!range) return todayCalendarParts();
    return {
      year: range.start.getFullYear(),
      month: range.start.getMonth() + 1,
      day: range.start.getDate(),
    };
  }, [upcomingEvents]);

  const [calendarMonth, setCalendarMonth] = useState(() => ({
    year: initialMonth.year,
    month: initialMonth.month,
  }));

  useEffect(() => {
    setCalendarMonth({ year: initialMonth.year, month: initialMonth.month });
  }, [initialMonth.month, initialMonth.year]);

  const warmEventDetail = useCallback((event: (typeof events)[number]) => {
    seedActivityDetailFromEventCard(event);
    const id = resolveEventCardLegacyId(event.id);
    if (id == null) {
      return;
    }
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

  const festivalEvents = useMemo(() => sortFestivalEventsByDate(events), [events]);

  const allEventsByDate = useMemo(() => sortAllEventsByDate(events), [events]);

  const calendarListEvents = useMemo(() => {
    const base = upcomingEvents
      .filter(isFestivalEvent)
      .sort(compareActivitiesNearestFirst);
    if (!selectedDay) return base;
    const onDay = base.filter((event) =>
      activityOccursOnDay(event, selectedDay.year, selectedDay.month, selectedDay.day),
    );
    return onDay.length > 0 ? onDay : base;
  }, [selectedDay, upcomingEvents]);

  const handleMonthChange = useCallback((year: number, month: number) => {
    setCalendarMonth({ year, month });
  }, []);

  const handleSelectDay = useCallback((year: number, month: number, day: number) => {
    setSelectedDay({ year, month, day });
    setCalendarMonth({ year, month });
  }, []);

  return (
    <View className="s-page-shell s-page-with-tabbar">
      <View className="s-page-with-tabbar__main s-events">
        <EventsPageHeader navInsets={navInsets} upcomingCount={upcomingEvents.length} />
        <View className="s-events__view-tabs-wrap">
          <EventsViewTabs activeTab={viewTab} onChange={setViewTab} />
        </View>

        {viewTab === 'map' ? (
          <View className="s-events__main s-events__main--map">
            {isLoading ? (
              <ThemedPageLoader variant="skeleton-feed" minHeight={280} />
            ) : (
              <EventsActivityMapTab
                events={upcomingEvents}
                listHeight={listScrollHeight ?? undefined}
                isError={isError}
                registeredLegacyIds={registeredLegacyIds}
                onRetry={() => void refetch()}
                onOpenDetail={openDetail}
                onWarmDetail={warmEventDetail}
              />
            )}
          </View>
        ) : (
          <ScrollView
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
              ) : viewTab === 'list' ? (
                <>
                  <View className="s-events__section-head s-events__section-head--list">
                    <Text className="s-events__section-title">全部活动</Text>
                  </View>
                  <EventsActivityList
                    events={allEventsByDate}
                    isError={isError}
                    emptyText="暂无活动"
                    registeredLegacyIds={registeredLegacyIds}
                    onRetry={() => void refetch()}
                    onOpenDetail={openDetail}
                    onWarmDetail={warmEventDetail}
                  />
                </>
              ) : (
                <>
                  <EventsActivityCalendar
                    activities={festivalEvents}
                    year={calendarMonth.year}
                    month={calendarMonth.month}
                    selected={selectedDay}
                    onMonthChange={handleMonthChange}
                    onSelectDay={handleSelectDay}
                  />

                  <View className="s-events__section-head">
                    <Text className="s-events__section-title">近期全部活动</Text>
                  </View>

                  <EventsActivityList
                    events={calendarListEvents}
                    isError={isError}
                    registeredLegacyIds={registeredLegacyIds}
                    onRetry={() => void refetch()}
                    onOpenDetail={openDetail}
                    onWarmDetail={warmEventDetail}
                  />
                </>
              )}
            </View>
          </ScrollView>
        )}
      </View>
      <GlobalAiAgentFab />
    </View>
  );
};

export default Events;
