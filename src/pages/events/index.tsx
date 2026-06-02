import './events.scss';
import { useDidShow } from '@tarojs/taro';
import React, { useCallback, useMemo, useState } from 'react';
import { Search, TrendingUp } from '../../components/icons';
import TabPageHeader from '../../components/navigation/TabPageHeader';
import { Button, Input } from '../../components/ui';
import { View, Text, ScrollView } from '@tarojs/components';
import { useEndRouteTransitionOnShow } from '../../hooks/useEndRouteTransitionOnShow';
import { useNavBarInsets } from '../../hooks/useNavBarInsets';
import { useTabPageMainHeight } from '../../hooks/useTabPageMainHeight';
import { EventCard } from '../../components/event';
import { ListState } from '../../components/ListState';
import ThemedPageLoader from '../../components/ThemedPageLoader';
import { seedActivityDetailFromEventCard } from '../../utils/activityDetailCache';
import { preloadEventSubpackage } from '../../utils/subpackagePreload';
import { buildEventDetailQuery, preloadPageSafe, ROUTES } from '../../utils/route';
import { useEventList, useHomeSummary } from '../../hooks/useSyncApi';
import { isApiEnabled } from '../../constants/api';
import { joinActivityWithAuth } from '../../utils/joinActivity';
import { parseActivityLegacyId } from '../../utils/activityLegacyId';
import { resolveEventCardLegacyId } from '../../utils/apiMappers';
import { goEventDetail, preloadHotRoutes } from '../../utils/route';
import {
  getActivityStatusFromActivity,
  type ActivityStatus,
} from '../../utils/activityStatus';

type EventFilterTab = 'all' | 'upcoming' | 'ended';

function matchesEventFilter(status: ActivityStatus, tab: EventFilterTab): boolean {
  if (tab === 'all') return true;
  if (tab === 'ended') return status === 'ended';
  return status !== 'ended';
}

/** Fixed header + search/tabs above the event list (px, design @ 375). */
const EVENTS_CHROME_PX = 158;
/** Baseline top padding in events.scss before status-bar inset. */
const EVENTS_HEADER_TOP_PX = 14;

const Events: React.FC = () => {
  useEndRouteTransitionOnShow();

  useDidShow(() => {
    preloadHotRoutes(ROUTES.EVENTS);
  });

  const navInsets = useNavBarInsets();
  const eventsChromePx = EVENTS_CHROME_PX - EVENTS_HEADER_TOP_PX + navInsets.paddingTop;
  const listScrollHeight = useTabPageMainHeight(eventsChromePx);

  const { events, isLoading, isError, refetch } = useEventList();
  const { data: homeSummary } = useHomeSummary();
  const registeredLegacyIds = useMemo(() => {
    if (!isApiEnabled()) {
      return new Set<number>();
    }
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
  const [activeTab, setActiveTab] = useState<EventFilterTab>('upcoming');
  const [searchQuery, setSearchQuery] = useState('');

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

  const handleJoinEvent = useCallback(
    (legacyId: string) => {
      const id = resolveEventCardLegacyId(legacyId);
      if (id == null) {
        return;
      }
      joinActivityWithAuth(id, {
        alreadyJoined: registeredLegacyIds.has(id),
        onSuccess: () => openDetail(legacyId),
      });
    },
    [openDetail, registeredLegacyIds],
  );

  const filteredEvents = useMemo(() => {
    const q = searchQuery.trim().toLowerCase();
    return events.filter((event) => {
      const status = getActivityStatusFromActivity(event.date, event.title);
      if (!matchesEventFilter(status, activeTab)) return false;
      if (!q) return true;
      return (
        event.title.toLowerCase().includes(q) ||
        event.location.toLowerCase().includes(q) ||
        event.date.includes(q)
      );
    });
  }, [activeTab, events, searchQuery]);

  const filterTabs: Array<{ id: EventFilterTab; label: string }> = [
    { id: 'all', label: '全部' },
    { id: 'upcoming', label: '即将开始' },
    { id: 'ended', label: '已结束' },
  ];

  return (
    <View className="s-page-shell s-page-with-tabbar">
      <View className="s-page-with-tabbar__main s-events">
        <TabPageHeader
          className="s-tab-page-header--events"
          navInsets={navInsets}
          trailing={
            <View
              className="s-events__count-pill"
              aria-label={`${events.length} 场活动`}
            >
              <TrendingUp size={14} aria-hidden />
              <Text>{`${events.length} 场活动`}</Text>
            </View>
          }
        />

        <View className="s-events__toolbar">
          <View className="s-events__search" aria-label="搜索活动、城市...">
            <Search size={18} className="s-events__search-icon" aria-hidden />
            <Input
              type="text"
              variant="events-search"
              placeholder="搜索活动、城市..."
              value={searchQuery}
              onInput={(e) => setSearchQuery(e.detail.value)}
            />
            {searchQuery && (
              <Button
                className="s-events__search-clear"
                onClick={() => setSearchQuery('')}
                aria-label="清空"
              >
                <Text className="s-btn-label">×</Text>
              </Button>
            )}
          </View>

          <View className="s-events__tabs" role="tablist" aria-label="活动筛选">
            {filterTabs.map((tab) => (
              <Button
                key={tab.id}
                role="tab"
                aria-selected={activeTab === tab.id}
                className={[
                  's-events__tab',
                  activeTab === tab.id ? 's-events__tab--active' : '',
                ]
                  .filter(Boolean)
                  .join(' ')}
                onClick={() => setActiveTab(tab.id)}
              >
                <Text className="s-btn-label">{tab.label}</Text>
              </Button>
            ))}
          </View>
        </View>

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
            ) : (
              <ListState
                isLoading={false}
                isError={isError}
                isEmpty={!isError && filteredEvents.length === 0}
                loadingText="加载活动中..."
                errorText="活动列表加载失败"
                emptyText="暂无活动"
                onRetry={() => void refetch()}
                retryText="重试"
                stateClassName="s-events__state"
                retryClassName="s-events__retry"
              >
                <View className="s-events__list">
                  {filteredEvents.map((event) => (
                    <View
                      key={event.id}
                      className="s-events__card-wrap"
                      role="button"
                      tabIndex={0}
                      onTouchStart={() => warmEventDetail(event)}
                      onClick={() => openDetail(event.id)}
                      onKeyDown={(e) => {
                        if (e.key !== 'Enter' && e.key !== ' ') return;
                        e.preventDefault();
                        openDetail(event.id);
                      }}
                    >
                      <EventCard
                        id={event.id}
                        title={event.title}
                        date={event.date}
                        location={event.location}
                        image={event.image}
                        attendees={event.attendees}
                        hot={event.hot}
                        going={registeredLegacyIds.has(
                          resolveEventCardLegacyId(event.id) ?? -1,
                        )}
                        variant="list"
                        onTeamUp={() => handleJoinEvent(event.id)}
                        onTeamUpWarmup={() => warmEventDetail(event)}
                      />
                    </View>
                  ))}
                </View>
              </ListState>
            )}
          </View>
        </ScrollView>
      </View>
    </View>
  );
};

export default Events;
