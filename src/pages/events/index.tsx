import "./events.scss";
import { useDidShow } from "@tarojs/taro";
import React, { useCallback, useEffect, useMemo, useState } from "react";
import { Search, TrendingUp } from "lucide-react-taro";
import SyncBrandMark from "../../components/SyncBrandMark";
import { View, Text, Input, Button, ScrollView } from "@tarojs/components";
import { BottomNavSlot } from "../../components/BottomNav";
import { useNavBarInsets } from "../../hooks/useNavBarInsets";
import { useTabPageMainHeight } from "../../hooks/useTabPageMainHeight";
import EventCard from "../../components/EventCard";
import { ListState } from "../../components/ListState";
import { useEventList } from "../../hooks/useSyncApi";
import { resolveEventCardLegacyId } from "../../utils/apiMappers";
import { goEventDetail, preloadHotRoutes } from "../../utils/route";
import {
  getActivityStatusFromActivity,
  type ActivityStatus,
} from "../../utils/activityStatus";

type EventFilterTab = "all" | "upcoming" | "ended";

function matchesEventFilter(status: ActivityStatus, tab: EventFilterTab): boolean {
  if (tab === "all") return true;
  if (tab === "ended") return status === "ended";
  return status !== "ended";
}

/** Fixed header + search/tabs above the event list (px, design @ 375). */
const EVENTS_CHROME_PX = 168;
/** Baseline top padding in events.scss before status-bar inset. */
const EVENTS_HEADER_TOP_PX = 14;

const Events: React.FC = () => {
  useEffect(() => {
    preloadHotRoutes();
  }, []);

  useDidShow(() => {
    preloadHotRoutes();
  });

  const navInsets = useNavBarInsets();
  const eventsChromePx =
    EVENTS_CHROME_PX - EVENTS_HEADER_TOP_PX + navInsets.paddingTop;
  const listScrollHeight = useTabPageMainHeight(eventsChromePx);

  const headerStyle =
    navInsets.paddingTop > 0 || navInsets.paddingRight > 16
      ? {
          ...(navInsets.paddingTop > 0
            ? { paddingTop: `${navInsets.paddingTop}px` }
            : {}),
          ...(navInsets.paddingRight > 16
            ? { paddingRight: `${navInsets.paddingRight}px` }
            : {}),
        }
      : undefined;
  const { events, isLoading, isError, refetch } = useEventList();
  const [activeTab, setActiveTab] = useState<EventFilterTab>("upcoming");
  const [searchQuery, setSearchQuery] = useState("");

  const openDetail = useCallback((legacyId: string) => {
    const id = resolveEventCardLegacyId(legacyId);
    if (id != null) {
      goEventDetail(id);
    }
  }, []);

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
    { id: "all", label: "全部" },
    { id: "upcoming", label: "即将开始" },
    { id: "ended", label: "已结束" },
  ];

  return (
    <View className="s-page-shell s-page-with-tabbar">
      <View className="s-page-with-tabbar__main s-events">
        <View className="s-events__header" style={headerStyle}>
          <SyncBrandMark subtitle="电音活动" />
          <View className="s-events__count-pill" aria-label={`${events.length} 场活动`}>
            <TrendingUp size={14} aria-hidden />
            <Text>{`${events.length} 场活动`}</Text>
          </View>
        </View>

        <View className="s-events__toolbar">
          <View className="s-events__search" aria-label="搜索活动、城市...">
            <Search size={18} className="s-events__search-icon" aria-hidden />
            <Input
              type="text"
              className="s-events__search-input"
              placeholder="搜索活动、城市..."
              value={searchQuery}
              onInput={(e) => setSearchQuery(e.target.value)}
            />
            {searchQuery && (
              <Button className="s-events__search-clear"
                onClick={() => setSearchQuery("")}
                aria-label="清空">
                <Text className="s-btn-label">×</Text>
              </Button>
            )}
          </View>

          <View className="s-events__tabs" role="tablist" aria-label="活动筛选">
            {filterTabs.map((tab) => (
              <Button
                key={tab.id} role="tab"
                aria-selected={activeTab === tab.id}
                className={[
                  "s-events__tab",
                  activeTab === tab.id ? "s-events__tab--active" : "",
                ]
                  .filter(Boolean)
                  .join(" ")}
                onClick={() => setActiveTab(tab.id)}>
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
          style={listScrollHeight != null ? { height: `${listScrollHeight}px` } : undefined}>
          <View className="s-events__scroll-inner">
          <ListState
            isLoading={isLoading}
            isError={isError}
            isEmpty={!isLoading && !isError && filteredEvents.length === 0}
            loadingText="加载活动中..."
            errorText="活动列表加载失败"
            emptyText="暂无活动"
            onRetry={() => void refetch()}
            retryText="重试"
            stateClassName="s-events__state"
            retryClassName="s-events__retry">
            <View className="s-events__list">
              {filteredEvents.map((event) => (
                <View
                  key={event.id}
                  className="s-events__card-wrap"
                  role="button"
                  tabIndex={0}
                  onClick={() => openDetail(event.id)}
                  onKeyDown={(e) => {
                    if (e.key !== "Enter" && e.key !== " ") return;
                    e.preventDefault();
                    openDetail(event.id);
                  }}>
                  <EventCard
                    id={event.id}
                    title={event.title}
                    date={event.date}
                    location={event.location}
                    image={event.image}
                    attendees={event.attendees}
                    hot={event.hot}
                    variant="list"
                    onTeamUp={() => openDetail(event.id)}
                  />
                </View>
              ))}
            </View>
          </ListState>
          </View>
        </ScrollView>
      </View>
      <BottomNavSlot />
    </View>
  );
};

export default Events;
