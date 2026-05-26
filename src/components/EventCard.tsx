import "./EventCard.scss";
import React, { useMemo } from "react";
import { useTranslation } from "react-i18next";
import AvatarGroup from "./AvatarGroup";
import { ACTIVITY_GUEST_AVATARS } from "../constants/activityGuestAvatars";
import { ActivityStatusBadge } from "./ActivityStatusBadge";
import { ImageWithFallback } from "./ImageWithFallback";
import { Button } from "./ui";
import { MapPinIcon } from "lucide-react";
import {
  type ActivityStatus,
  activityStatusCardClass,
  getActivityStatusFromActivity,
} from "../utils/activityStatus";

interface EventCardProps {
  title?: string;
  date?: string;
  location?: string;
  image?: string;
  attendees?: number;
  hot?: boolean;
  variant?: "default" | "list";
}

const EventCard: React.FC<EventCardProps> = ({
  title = "Audien",
  date = "Sat 12/20 at 10:00 PM",
  location = "The Ave Live",
  image = "https://images.unsplash.com/photo-1514525253161-7a46d19cd819?w=400&q=80",
  attendees = 70,
  hot = false,
  variant = "list",
}) => {
  const { t } = useTranslation();
  const status = getActivityStatusFromActivity(date, title);
  const badgeStatus = useMemo((): ActivityStatus => {
    if (variant !== "list") return status;
    return status === "ended" ? "ended" : "not_started";
  }, [status, variant]);

  return (
    <div
      data-cmp="EventCard"
      className={["s-event-card", activityStatusCardClass(status)].filter(Boolean).join(" ")}
    >
      <ImageWithFallback
        src={image}
        alt={title}
        imageClassName="s-event-card__img"
        placeholderClassName="s-event-card__img s-event-card__img--placeholder"
        fallback={title.slice(0, 2)}
      />

      <div className="s-event-card__body">
        <ActivityStatusBadge
          date={date}
          title={title}
          status={badgeStatus}
          alwaysShow
          className="s-event-card__status"
        />

        <h3 className="s-event-card__title">{title}</h3>
        <p className="s-event-card__date s-line-clamp-1">{date}</p>

        <div className="s-event-card__row">
          <MapPinIcon size={12} className="s-event-card__row-icon" />
          <span className="s-event-card__loc">{location}</span>
          {hot ? <span className="s-event-card__hot">{t("common.hot")}</span> : null}
        </div>

        <div className="s-event-card__footer">
          <AvatarGroup avatars={ACTIVITY_GUEST_AVATARS} total={attendees} />
          <Button className="s-event-card__btn">{t("common.view")}</Button>
        </div>
      </div>
    </div>
  );
};

export default EventCard;
