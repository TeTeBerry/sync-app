import "./events.scss";
import React, { useCallback, useMemo, useState } from "react";
import { AudioWaveform, Search, TrendingUp,  } from "lucide-react-taro";
import { View, Text, Input, Button } from "@tarojs/components";
import BottomNav from "../../components/BottomNav";
import EventCard from "../../components/EventCard";
import { ListState } from "../../components/ListState";
import { useEventList } from "../../hooks/useSyncApi";
import { goEventDetail } from "../../utils/route";
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

const Events: React.FC = () => {
  const { events, isLoading, isError, refetch } = useEventList();
  const [activeTab, setActiveTab] = useState<EventFilterTab>("upcoming");
  const [searchQuery, setSearchQuery] = useState("");

  const openDetail = useCallback((legacyId: string) => {
    const id = Number(legacyId);
    if (!Number.isNaN(id) && id > 0) {
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
    <View className="s-page-shell">
      <View className="s-events">
        <View className="s-events__header">
          <View className="s-events__brand">
            <AudioWaveform size={24} className="s-events__brand-icon" aria-hidden />
            <View className="s-events__brand-copy">
              <Text className="s-events__brand-title">SYNC</Text>
              <Text className="s-events__brand-subtitle">电音活动</Text>
            </View>
          </View>
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
              <Button
                type="button"
                className="s-events__search-clear"
                onClick={() => setSearchQuery("")}
                aria-label="清空"
              >
                ×
              </Button>
            )}
          </View>

          <View className="s-events__tabs" role="tablist" aria-label="活动筛选">
            {filterTabs.map((tab) => (
              <Button
                key={tab.id}
                type="button"
                role="tab"
                aria-selected={activeTab === tab.id}
                className={[
                  "s-events__tab",
                  activeTab === tab.id ? "s-events__tab--active" : "",
                ]
                  .filter(Boolean)
                  .join(" ")}
                onClick={() => setActiveTab(tab.id)}
              >
                {tab.label}
              </Button>
            ))}
          </View>
        </View>

        <View className="s-events__main s-scrollbar-none">
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
            retryClassName="s-events__retry"
          >
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
                    variant="list"
                    onTeamUp={() => openDetail(event.id)}
                  />
                </View>
              ))}
            </View>
          </ListState>
        </View>
      </View>
      <BottomNav />
    </View>
  );
};

export default Events;
