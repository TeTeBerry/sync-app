import "./events.scss";
import React, { useCallback } from "react";
import { useTranslation } from "react-i18next";
import BottomNav from "../../components/BottomNav";
import EventCard from "../../components/EventCard";
import { ListState } from "../../components/ListState";
import TopBar from "../../components/TopBar";
import { useEventList } from "../../hooks/useSyncApi";
import { goEventDetail } from "../../utils/route";

const Events: React.FC = () => {
  const { t } = useTranslation();
  const { events, isLoading, isError, refetch } = useEventList();

  const openDetail = useCallback((legacyId: string) => {
    const id = Number(legacyId);
    if (!Number.isNaN(id) && id > 0) {
      goEventDetail(id);
    }
  }, []);

  return (
    <div className="s-page-shell">
      <TopBar />
      <div className="s-events">
        <main className="s-events__main s-scrollbar-none">
          <ListState
            isLoading={isLoading}
            isError={isError}
            isEmpty={!isLoading && !isError && events.length === 0}
            loadingText={t("events.loading")}
            errorText={t("events.error")}
            emptyText={t("events.empty")}
            onRetry={() => void refetch()}
            retryText={t("common.retry")}
            stateClassName="s-events__state"
            retryClassName="s-events__retry"
          >
            <div className="s-events__list">
              {events.map((event) => (
                <button
                  key={event.id}
                  type="button"
                  className="s-events__card-wrap"
                  onClick={() => openDetail(event.id)}
                >
                  <EventCard
                    title={event.title}
                    date={event.date}
                    location={event.location}
                    image={event.image}
                    attendees={event.attendees}
                    hot={event.hot}
                    variant="list"
                  />
                </button>
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
