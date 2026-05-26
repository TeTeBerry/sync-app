import { UsersIcon } from "lucide-react";
import { useCallback, useState, type FC } from "react";
import { useTranslation } from "react-i18next";
import { Button } from "../../../components/ui";
import {
  activityStatusBadgeClass,
  activityStatusCardClass,
  activityStatusI18nKey,
  getActivityStatusFromActivity,
  shouldShowActivityStatusBadge,
} from "../../../utils/activityStatus";
import type { FeaturedEvent } from "../homeData";

type HomeFeaturedEventsProps = {
  items: FeaturedEvent[];
  onEventClick: (item: FeaturedEvent) => void;
  onJoinClick: (item: FeaturedEvent) => void;
};

export const HomeFeaturedEvents: FC<HomeFeaturedEventsProps> = ({
  items,
  onEventClick,
  onJoinClick,
}) => {
  const { t } = useTranslation();
  const [brokenImages, setBrokenImages] = useState<Set<number>>(() => new Set());

  const markImageBroken = useCallback((eventId: number) => {
    setBrokenImages((prev) => {
      if (prev.has(eventId)) return prev;
      const next = new Set(prev);
      next.add(eventId);
      return next;
    });
  }, []);

  if (items.length === 0) {
    return (
      <section className="s-home-featured" aria-label="Featured events">
        <p className="s-home-featured__empty">{t("home.featured.empty")}</p>
      </section>
    );
  }

  return (
  <section className="s-home-featured" aria-label="Featured events">
    {items.map((event) => {
      const showImage = Boolean(event.image) && !brokenImages.has(event.id);
      const status = getActivityStatusFromActivity(event.date, event.title);

      return (
      <article
        key={event.id}
        className={["s-home-event", activityStatusCardClass(status)].filter(Boolean).join(" ")}
      >
        <div className={showImage ? "s-home-event__media" : "s-home-event__media s-home-event__media--logo"}>
          {showImage ? (
            <img
              src={event.image}
              alt={event.title}
              referrerPolicy="no-referrer"
              onError={() => markImageBroken(event.id)}
            />
          ) : (
            <span>{event.logo?.replace(/\n/g, " ")}</span>
          )}
        </div>

        <div className="s-home-event__content">
          <Button className="s-home-event__main" onClick={() => onEventClick(event)}>
            <div className="s-home-event__title-row">
              <h2>{event.title}</h2>
              {shouldShowActivityStatusBadge(status) ? (
                <span className={activityStatusBadgeClass(status)}>
                  {t(activityStatusI18nKey(status))}
                </span>
              ) : null}
            </div>
            <p>
              <strong>{event.date}</strong>
              <span className="s-home-event__at"> at </span>
              <span className="s-home-event__venue">{event.venue}</span>
            </p>
            <small>{event.distance}</small>
          </Button>

          <div className="s-home-event__footer">
            <div className="s-home-event__meta">
              <span className="s-home-event__team" aria-hidden>
                {event.guests.map((guest, index) => (
                  <img key={guest} src={guest} alt="" style={{ zIndex: event.guests.length - index }} />
                ))}
              </span>
              <span className="s-home-event__count">{event.price}</span>
              <UsersIcon size={14} className="s-home-event__count-icon" />
            </div>

            <Button
              className="s-home-event__join"
              disabled={status === "ended"}
              onClick={() => onJoinClick(event)}
            >
              {status === "ended" ? t("activityStatus.ended") : "加入"}
            </Button>
          </div>
        </div>
      </article>
    );
    })}
  </section>
  );
};
