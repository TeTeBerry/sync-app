import React, { useState } from "react";
import {
  ChevronDownIcon,
  ChevronLeftIcon,
  ChevronRightIcon,
  ChevronUpIcon,
} from "lucide-react";
import { useTranslation } from "react-i18next";
import { useClientPagination } from "../../hooks/useClientPagination";

const SECTION_VARIANTS = {
  activities: {
    modifier: "s-profile-section--activities",
    icon: "s-profile-section__icon--pink",
    badge: "s-profile-section__badge--pink",
  },
  posts: {
    modifier: "s-profile-section--posts",
    icon: "s-profile-section__icon--cyan",
    badge: "s-profile-section__badge--cyan",
  },
} as const;

export type ProfileCollapsibleSectionProps<T> = {
  variant: keyof typeof SECTION_VARIANTS;
  icon: React.ReactNode;
  title: string;
  items: T[];
  pageSize?: number;
  children: (pageItems: T[]) => React.ReactNode;
};

export function ProfileCollapsibleSection<T>({
  variant,
  icon,
  title,
  items,
  pageSize = 2,
  children,
}: ProfileCollapsibleSectionProps<T>) {
  const { t } = useTranslation();
  const [expanded, setExpanded] = useState(false);
  const { page, totalPages, pageItems, goPrev, goNext, resetPage } = useClientPagination(
    items,
    pageSize,
  );
  const styles = SECTION_VARIANTS[variant];

  const toggleExpanded = () => {
    setExpanded((prev) => !prev);
    resetPage();
  };

  return (
    <section
      className={[
        "s-profile-section",
        styles.modifier,
        expanded ? " s-profile-section--expanded" : "",
      ].join("")}
    >
      <div
        className="s-profile-section__header"
        role="button"
        tabIndex={0}
        onClick={toggleExpanded}
        onKeyDown={(event) => {
          if (event.key === "Enter" || event.key === " ") {
            event.preventDefault();
            toggleExpanded();
          }
        }}
      >
        <span className="s-profile-section__header-left">
          <span className={`s-profile-section__icon ${styles.icon}`}>{icon}</span>
          <span className="s-profile-section__title">{title}</span>
          <span className={`s-profile-section__badge ${styles.badge}`}>{items.length}</span>
        </span>

        <span className="s-profile-section__header-right">
          {expanded ? (
            <span
              className="s-profile-section__pagination"
              onClick={(event) => event.stopPropagation()}
            >
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
      </div>

      {expanded ? (
        <div className="s-profile-section__body">{children(pageItems)}</div>
      ) : null}
    </section>
  );
}
