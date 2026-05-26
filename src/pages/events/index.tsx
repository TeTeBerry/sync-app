import "./events.scss";
import React, { useCallback } from "react";
import { useTranslation } from "react-i18next";
import BottomNav from "../../components/BottomNav";
import EventCard from "../../components/EventCard";
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
          {isLoading ? (
            <p className="s-events__state">{t("events.loading")}</p>
          ) : isError ? (
            <div className="s-events__state">
              <p>{t("events.error")}</p>
              <button type="button" className="s-events__retry" onClick={() => void refetch()}>
                {t("common.retry")}
              </button>
            </div>
          ) : events.length === 0 ? (
            <p className="s-events__state">{t("events.empty")}</p>
          ) : (
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
                    distance={event.distance}
                    image={event.image}
                    attendees={event.attendees}
                  />
                </button>
              ))}
            </div>
          )}
        </main>
      </div>
      <BottomNav />
    </div>
  );
};

export default Events;
