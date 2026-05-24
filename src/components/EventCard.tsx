import "./EventCard.scss";
import React from "react";
import { useTranslation } from "react-i18next";
import AvatarGroup from "./AvatarGroup";
import { Button } from "./ui";
import { MapPinIcon } from "lucide-react";

interface EventCardProps {
  title?: string;
  date?: string;
  location?: string;
  distance?: string;
  image?: string;
  attendees?: number;
}

const EventCard: React.FC<EventCardProps> = ({
  title = "Audien",
  date = "Sat 12/20 at 10:00 PM",
  location = "The Ave Live",
  distance = "22 mi",
  image = "https://images.unsplash.com/photo-1514525253161-7a46d19cd819?w=400&q=80",
  attendees = 70,
}) => {
  const { t } = useTranslation();

  return (
    <div data-cmp="EventCard" className="s-event-card">
      <div className="s-event-card__blob" />

      <img src={image} alt={title} className="s-event-card__img" />

      <div className="s-event-card__body">
        <div>
          <h3 className="s-event-card__title">{title}</h3>
          <p className="s-event-card__date s-line-clamp-1">{date}</p>
          <div className="s-event-card__row">
            <MapPinIcon size={12} className="s-event-card__row-icon" />
            <span className="s-event-card__loc">{location}</span>
            <span className="s-event-card__dot">•</span>
            <span className="s-event-card__dist">{distance}</span>
          </div>
        </div>

        <div className="s-event-card__footer">
          <AvatarGroup total={attendees} />
          <Button className="s-event-card__btn">{t("common.view")}</Button>
        </div>
      </div>
    </div>
  );
};

export default EventCard;
