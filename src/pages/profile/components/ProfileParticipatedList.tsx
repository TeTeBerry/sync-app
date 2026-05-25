import React from "react";
import { CalendarIcon, MapPinIcon } from "lucide-react";
import { useTranslation } from "react-i18next";
import type { ProfileParticipatedItem } from "../../../utils/profileParticipated";

export type ProfileParticipatedListProps = {
  items: ProfileParticipatedItem[];
  isLoading?: boolean;
  isError?: boolean;
  onRetry?: () => void;
  onItemTap?: (item: ProfileParticipatedItem) => void;
};

const ProfileParticipatedList: React.FC<ProfileParticipatedListProps> = ({
  items,
  isLoading = false,
  isError = false,
  onRetry,
  onItemTap,
}) => {
  const { t } = useTranslation();

  const statusClass = (status: ProfileParticipatedItem["status"]) =>
    `s-profile__event-status s-profile__event-status--${status}`;

  if (isLoading) {
    return <div className="s-profile-participated__empty">{t("common.loading")}</div>;
  }

  if (isError) {
    return (
      <div className="s-profile-participated__empty">
        <span>{t("common.loadError")}</span>
        {onRetry ? (
          <button type="button" className="s-profile-participated__retry" onClick={onRetry}>
            {t("common.retry")}
          </button>
        ) : null}
      </div>
    );
  }

  if (items.length === 0) {
    return <div className="s-profile-participated__empty">{t("profile.participated.empty")}</div>;
  }

  return (
    <div className="s-profile-participated">
      {items.map((event) => (
        <button
          key={event.id}
          type="button"
          className="s-profile__event-row"
          onClick={() => onItemTap?.(event)}
        >
          <img className="s-profile__event-thumb" src={event.image} alt="" />
          <div className="s-profile__event-info">
            <div className="s-profile__event-title">{event.title}</div>
            {event.date ? (
              <div className="s-profile__event-date">
                <CalendarIcon size={12} />
                <span>{event.date}</span>
              </div>
            ) : null}
            {event.location ? (
              <div className="s-profile__event-date">
                <MapPinIcon size={12} />
                <span>{event.location}</span>
              </div>
            ) : null}
          </div>
          <span className={statusClass(event.status)}>
            {t(`profile.eventStatus.${event.status}`)}
          </span>
        </button>
      ))}
    </div>
  );
};

export default ProfileParticipatedList;
