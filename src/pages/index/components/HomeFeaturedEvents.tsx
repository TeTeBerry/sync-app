import type { FC } from "react";
import { Button } from "../../../components/ui";
import type { FeaturedMarketEvent } from "../homeMarketData";

type HomeFeaturedEventsProps = {
  items: FeaturedMarketEvent[];
  onEventClick: (item: FeaturedMarketEvent) => void;
  onJoinClick: (item: FeaturedMarketEvent) => void;
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
          {event.image ? <img src={event.image} alt={event.title} /> : <span>{event.logo}</span>}
        </div>

        <Button className="s-home-event__main" onClick={() => onEventClick(event)}>
          <div className="s-home-event__info">
            <h2>{event.title}</h2>
            <p>
              <strong>{event.date}</strong>
              <span> at {event.venue}</span>
            </p>
            <small>{event.distance}</small>
          </div>
          <div className="s-home-event__meta">
            <span className="s-home-event__team" aria-hidden>
              {event.guests.map((guest, index) => (
                <img key={guest} src={guest} alt="" style={{ zIndex: event.guests.length - index }} />
              ))}
            </span>
            <span className="s-home-event__price">{event.price}</span>
            <span className="s-home-event__sub">需 {event.remaining}</span>
          </div>
        </Button>

        <Button className="s-home-event__join" onClick={() => onJoinClick(event)}>
          组队
        </Button>
      </article>
    ))}
  </section>
);
