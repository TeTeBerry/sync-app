import { UsersIcon } from "lucide-react";
import { type FC } from "react";
import { useTranslation } from "react-i18next";
import { ActivityStatusBadge } from "../../../components/ActivityStatusBadge";
import { ImageWithFallback } from "../../../components/ImageWithFallback";
import { Button } from "../../../components/ui";
import {
  activityStatusCardClass,
  getActivityStatusFromActivity,
} from "../../../utils/activityStatus";
import type { FeaturedEvent } from "../../../utils/apiMappers";

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
        const status = getActivityStatusFromActivity(event.date, event.title);

        return (
          <article
            key={event.id}
            className={["s-home-event", activityStatusCardClass(status)].filter(Boolean).join(" ")}
          >
            <ImageWithFallback
              src={event.image}
              alt={event.title}
              wrapperClassName="s-home-event__media"
              fallbackWrapperClassName="s-home-event__media s-home-event__media--logo"
              fallback={<span>{event.logo?.replace(/\n/g, " ")}</span>}
            />

            <div className="s-home-event__content">
              <Button className="s-home-event__main" onClick={() => onEventClick(event)}>
                <div className="s-home-event__title-row">
                  <h2>{event.title}</h2>
                  <ActivityStatusBadge date={event.date} title={event.title} status={status} />
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
                      <img
                        key={guest}
                        src={guest}
                        alt=""
                        style={{ zIndex: event.guests.length - index }}
                      />
                    ))}
                  </span>
                  <span className="s-home-event__count">{event.attendeeCount}</span>
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
