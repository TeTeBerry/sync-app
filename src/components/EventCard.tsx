import "./EventCard.scss";
import React, { useMemo } from "react";
import { useTranslation } from "react-i18next";
import AvatarGroup from "./AvatarGroup";
import { ACTIVITY_GUEST_AVATARS } from "../constants/activityGuestAvatars";
import { ImageWithFallback } from "./ImageWithFallback";
import { Button } from "./ui";
import {
  CalendarIcon,
  FlameIcon,
  MapPinIcon,
  SparklesIcon,
  UsersIcon,
} from "lucide-react";
import {
  activityStatusCardClass,
  getActivityStatusFromActivity,
} from "../utils/activityStatus";
import {
  deriveEventCardStats,
  formatEventDateBadge,
  formatEventFullDate,
  formatEventHeroSubtitle,
} from "../utils/eventCardDisplay";

interface EventCardProps {
  id?: string;
  title?: string;
  date?: string;
  location?: string;
  image?: string;
  attendees?: number;
  hot?: boolean;
  variant?: "default" | "list";
  onTeamUp?: () => void;
}

const EventCard: React.FC<EventCardProps> = ({
  id = "1",
  title = "Audien",
  date = "Sat 12/20 at 10:00 PM",
  location = "The Ave Live",
  image = "https://images.unsplash.com/photo-1514525253161-7a46d19cd819?w=400&q=80",
  attendees = 70,
  hot = false,
  variant = "list",
  onTeamUp,
}) => {
  const { t } = useTranslation();
  const status = getActivityStatusFromActivity(date, title);
  const dateBadge = useMemo(() => formatEventDateBadge(date), [date]);
  const fullDate = useMemo(() => formatEventFullDate(date, title), [date, title]);
  const heroSubtitle = useMemo(
    () => formatEventHeroSubtitle(title, location),
    [title, location],
  );
  const stats = useMemo(
    () => deriveEventCardStats(attendees),
    [attendees],
  );

  if (variant !== "list") {
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
          <h3 className="s-event-card__title">{title}</h3>
          <p className="s-event-card__date s-line-clamp-1">{date}</p>
        </div>
      </div>
    );
  }

  return (
    <article
      data-cmp="EventCard"
      className={[
        "s-event-card",
        "s-event-card--list",
        activityStatusCardClass(status),
      ]
        .filter(Boolean)
        .join(" ")}
    >
      <div className="s-event-card__hero">
        <ImageWithFallback
          src={image}
          alt={title}
          imageClassName="s-event-card__hero-img"
          placeholderClassName="s-event-card__hero-img s-event-card__hero-img--placeholder"
          fallback={title.slice(0, 2)}
        />
        <div className="s-event-card__hero-scrim" aria-hidden />

        <div className="s-event-card__date-badge" aria-hidden>
          <span className="s-event-card__date-primary">{dateBadge.primary}</span>
          {dateBadge.secondary ? (
            <span className="s-event-card__date-secondary">{dateBadge.secondary}</span>
          ) : null}
        </div>

        {hot ? (
          <span className="s-event-card__hot-tag">
            <FlameIcon size={12} aria-hidden />
            {t("common.hot")}
          </span>
        ) : null}

        <div className="s-event-card__hero-copy">
          <h3 className="s-event-card__hero-title">{title}</h3>
          {heroSubtitle ? (
            <p className="s-event-card__hero-subtitle">{heroSubtitle}</p>
          ) : null}
        </div>
      </div>

      <div className="s-event-card__info-row">
        <div className="s-event-card__info-item">
          <MapPinIcon size={14} className="s-event-card__info-icon" aria-hidden />
          <span className="s-event-card__info-text">{location}</span>
        </div>
        {fullDate ? (
          <div className="s-event-card__info-item s-event-card__info-item--date">
            <CalendarIcon size={14} className="s-event-card__info-icon" aria-hidden />
            <span className="s-event-card__info-text">{fullDate}</span>
          </div>
        ) : null}
      </div>

      <div className="s-event-card__footer">
        <div className="s-event-card__social">
          <AvatarGroup avatars={ACTIVITY_GUEST_AVATARS} total={attendees} />
          <div className="s-event-card__team-posts">
            <UsersIcon size={13} aria-hidden />
            <span>{t("events.teamPosts", { count: stats.teamPostCount })}</span>
          </div>
        </div>

        <div className="s-event-card__cta">
          <Button
            type="button"
            className="s-event-card__team-btn"
            onClick={(event) => {
              event.stopPropagation();
              onTeamUp?.();
            }}
          >
            <SparklesIcon size={15} aria-hidden />
            {t("events.teamUp")}
          </Button>
        </div>
      </div>
    </article>
  );
};

export default EventCard;
