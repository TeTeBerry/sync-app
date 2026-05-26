import React, { useMemo, useState } from "react";
import {
  CalendarIcon,
  ChevronDownIcon,
  ChevronLeftIcon,
  ChevronRightIcon,
  ChevronUpIcon,
  MapPinIcon,
  TicketIcon,
} from "lucide-react";
import { useTranslation } from "react-i18next";
import type { ProfileActivityItem } from "../mockData";

const PAGE_SIZE = 2;

export type ProfileActivitiesSectionProps = {
  items: ProfileActivityItem[];
};

const ProfileActivitiesSection: React.FC<ProfileActivitiesSectionProps> = ({
  items,
}) => {
  const { t } = useTranslation();
  const [expanded, setExpanded] = useState(false);
  const [page, setPage] = useState(0);

  const totalPages = Math.max(1, Math.ceil(items.length / PAGE_SIZE));
  const pageItems = useMemo(
    () => items.slice(page * PAGE_SIZE, page * PAGE_SIZE + PAGE_SIZE),
    [items, page],
  );

  const toggleExpanded = () => {
    setExpanded((prev) => !prev);
    setPage(0);
  };

  const goPrev = () => setPage((prev) => Math.max(0, prev - 1));
  const goNext = () => setPage((prev) => Math.min(totalPages - 1, prev + 1));

  return (
    <section className={`s-profile-section s-profile-section--activities${expanded ? " s-profile-section--expanded" : ""}`}>
      <button type="button" className="s-profile-section__header" onClick={toggleExpanded}>
        <span className="s-profile-section__header-left">
          <span className="s-profile-section__icon s-profile-section__icon--pink">
            <TicketIcon size={14} />
          </span>
          <span className="s-profile-section__title">{t("profile.myActivities.title")}</span>
          <span className="s-profile-section__badge s-profile-section__badge--pink">{items.length}</span>
        </span>

        <span className="s-profile-section__header-right">
          {expanded ? (
            <span className="s-profile-section__pagination" onClick={(event) => event.stopPropagation()}>
              <button
                type="button"
                className="s-profile-section__page-btn"
                disabled={page === 0}
                aria-label={t("profile.pagination.prev")}
                onClick={goPrev}
              >
                <ChevronLeftIcon size={16} />
              </button>
              <span className="s-profile-section__page-label">
                {page + 1}/{totalPages}
              </span>
              <button
                type="button"
                className="s-profile-section__page-btn"
                disabled={page >= totalPages - 1}
                aria-label={t("profile.pagination.next")}
                onClick={goNext}
              >
                <ChevronRightIcon size={16} />
              </button>
            </span>
          ) : null}
          {expanded ? <ChevronUpIcon size={18} /> : <ChevronDownIcon size={18} />}
        </span>
      </button>

      {expanded ? (
        <div className="s-profile-section__body">
          {pageItems.map((item) => (
            <article key={item.id} className="s-profile-activity">
              <img className="s-profile-activity__thumb" src={item.image} alt="" />
              <div className="s-profile-activity__content">
                <div className="s-profile-activity__top">
                  <h3 className="s-profile-activity__title">{item.title}</h3>
                  <span className="s-profile-activity__status">
                    {t(`profile.eventStatus.${item.status}`)}
                  </span>
                </div>

                <div className="s-profile-activity__meta">
                  <span className="s-profile-activity__meta-item">
                    <CalendarIcon size={12} />
                    {item.date}
                  </span>
                  <span className="s-profile-activity__meta-item">
                    <MapPinIcon size={12} />
                    {item.location}
                  </span>
                </div>

                <div className="s-profile-activity__foot">
                  <span className="s-profile-activity__price">¥{item.price.toLocaleString()}</span>
                </div>
              </div>
            </article>
          ))}
        </div>
      ) : null}
    </section>
  );
};

export default ProfileActivitiesSection;
