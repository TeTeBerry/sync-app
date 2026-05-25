import React, { useCallback } from "react";
import {
  ArrowRightIcon,
  CalendarIcon,
  ClockIcon,
  PhoneIcon,
  TagIcon,
  TicketIcon,
} from "lucide-react";
import { useTranslation } from "react-i18next";
import type { ProfileTicketItem } from "../../../types/backend";
import { goTickets } from "../../../utils/route";

export type ProfileTicketListProps = {
  items: ProfileTicketItem[];
  highlightId?: string | null;
  isLoading?: boolean;
  isError?: boolean;
  onRetry?: () => void;
};

const ProfileTicketList: React.FC<ProfileTicketListProps> = ({
  items,
  highlightId = null,
  isLoading = false,
  isError = false,
  onRetry,
}) => {
  const { t } = useTranslation();

  const handleMore = useCallback(() => {
    goTickets();
  }, []);

  if (isLoading) {
    return <div className="s-profile-tickets__empty">{t("common.loading")}</div>;
  }

  if (isError) {
    return (
      <div className="s-profile-tickets__empty">
        <span>{t("common.loadError")}</span>
        {onRetry ? (
          <button type="button" className="s-profile-tickets__retry" onClick={onRetry}>
            {t("common.retry")}
          </button>
        ) : null}
      </div>
    );
  }

  return (
    <div className="s-profile-tickets">
      <div className="s-profile-tickets__head">
        <div className="s-profile-tickets__head-left">
          <span className="s-profile-tickets__head-icon" aria-hidden>
            <TicketIcon size={14} />
          </span>
          <span className="s-profile-tickets__head-title">{t("profile.myTickets.title")}</span>
          <span className="s-profile-tickets__head-badge">{items.length}</span>
        </div>
        <button type="button" className="s-profile-tickets__more" onClick={handleMore}>
          <span>{t("profile.myTickets.more")}</span>
          <ArrowRightIcon size={14} />
        </button>
      </div>

      <div className="s-profile-tickets__list">
        {items.length === 0 ? (
          <div className="s-profile-tickets__empty">{t("profile.myTickets.empty")}</div>
        ) : (
          items.map((item) => (
            <article
              key={item.id}
              id={`profile-ticket-${item.id}`}
              className={`s-profile-tickets__card${
                highlightId === item.id ? " s-profile-tickets__card--focused" : ""
              }`}
            >
              <div className="s-profile-tickets__card-top">
                <span
                  className={`s-profile-tickets__type s-profile-tickets__type--${item.type}`}
                >
                  {t(`profile.myTickets.type.${item.type}`)}
                </span>
                <span className="s-profile-tickets__created">
                  <ClockIcon size={12} />
                  {t("profile.myTickets.createdAt", { time: item.createdAt })}
                </span>
              </div>

              <h3 className="s-profile-tickets__event">{item.displayEventName}</h3>

              <div className="s-profile-tickets__meta">
                <span className="s-profile-tickets__meta-item">
                  <TagIcon size={12} />
                  {item.skuCode}
                </span>
                <span className="s-profile-tickets__meta-item">
                  <CalendarIcon size={12} />
                  {item.eventDate || t("profile.myTickets.datePending")}
                </span>
              </div>

              <div className="s-profile-tickets__foot">
                <div className="s-profile-tickets__qty">
                  {t("profile.myTickets.quantity", { count: item.quantity })}
                </div>
                <div className="s-profile-tickets__price">
                  <span className="s-profile-tickets__price-currency">¥</span>
                  <span className="s-profile-tickets__price-value">{item.price}</span>
                  <span className="s-profile-tickets__price-unit">
                    {t("profile.myTickets.perTicket")}
                  </span>
                </div>
              </div>

              {item.contact ? (
                <div className="s-profile-tickets__contact">
                  <PhoneIcon size={12} />
                  <span>{item.contact}</span>
                </div>
              ) : null}
            </article>
          ))
        )}
      </div>
    </div>
  );
};

export default ProfileTicketList;
