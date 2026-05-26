import "./events.scss";
import React, { useCallback, useMemo, useState } from "react";
import { useTranslation } from "react-i18next";
import {
  AudioWaveformIcon,
  SearchIcon,
  TrendingUpIcon,
} from "lucide-react";
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
  const { t } = useTranslation();
  const { events, isLoading, isError, refetch } = useEventList();
  const [activeTab, setActiveTab] = useState<EventFilterTab>("upcoming");

  const openDetail = useCallback((legacyId: string) => {
    const id = Number(legacyId);
    if (!Number.isNaN(id) && id > 0) {
      goEventDetail(id);
    }
  }, []);

  const filteredEvents = useMemo(() => {
    return events.filter((event) => {
      const status = getActivityStatusFromActivity(event.date, event.title);
      return matchesEventFilter(status, activeTab);
    });
  }, [activeTab, events]);

  const filterTabs: Array<{ id: EventFilterTab; label: string }> = [
    { id: "all", label: t("common.all") },
    { id: "upcoming", label: t("events.tabs.upcoming") },
    { id: "ended", label: t("activityStatus.ended") },
  ];

  return (
    <div className="s-page-shell">
      <div className="s-events">
        <header className="s-events__header">
          <div className="s-events__brand">
            <AudioWaveformIcon size={24} className="s-events__brand-icon" aria-hidden />
            <div className="s-events__brand-copy">
              <span className="s-events__brand-title">SYNC</span>
              <span className="s-events__brand-subtitle">{t("events.subtitle")}</span>
            </div>
          </div>
          <div className="s-events__count-pill" aria-label={t("events.countLabel", { count: events.length })}>
            <TrendingUpIcon size={14} aria-hidden />
            <span>{t("events.countLabel", { count: events.length })}</span>
          </div>
        </header>

        <div className="s-events__toolbar">
          <div className="s-events__search" aria-label={t("events.searchPlaceholder")}>
            <SearchIcon size={18} className="s-events__search-icon" aria-hidden />
            <span className="s-events__search-placeholder">{t("events.searchPlaceholder")}</span>
          </div>

          <div className="s-events__tabs" role="tablist" aria-label={t("events.tabsLabel")}>
            {filterTabs.map((tab) => (
              <button
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
              </button>
            ))}
          </div>
        </div>

        <main className="s-events__main s-scrollbar-none">
          <ListState
            isLoading={isLoading}
            isError={isError}
            isEmpty={!isLoading && !isError && filteredEvents.length === 0}
            loadingText={t("events.loading")}
            errorText={t("events.error")}
            emptyText={t("events.empty")}
            onRetry={() => void refetch()}
            retryText={t("common.retry")}
            stateClassName="s-events__state"
            retryClassName="s-events__retry"
          >
            <div className="s-events__list">
              {filteredEvents.map((event) => (
                <div
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
                </div>
              ))}
            </div>
          </ListState>
        </main>
      </div>
      <BottomNav />
    </div>
  );
};

export default Events;
