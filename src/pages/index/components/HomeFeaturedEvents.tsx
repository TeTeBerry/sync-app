import { UsersIcon } from "lucide-react";
import type { FC } from "react";
import { Button } from "../../../components/ui";
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
}) => (
  <section className="s-home-featured" aria-label="Featured events">
    {items.map((event) => (
      <article key={event.id} className="s-home-event">
        <div className={event.image ? "s-home-event__media" : "s-home-event__media s-home-event__media--logo"}>
          {event.image ? <img src={event.image} alt={event.title} /> : <span>{event.logo?.replace(/\n/g, " ")}</span>}
        </div>

        <div className="s-home-event__content">
          <Button className="s-home-event__main" onClick={() => onEventClick(event)}>
            <h2>{event.title}</h2>
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

            <Button className="s-home-event__join" onClick={() => onJoinClick(event)}>
              加入
            </Button>
          </div>
        </div>
      </article>
    ))}
  </section>
);
