import React, { useMemo, useState } from "react";
import {
  CheckCircleIcon,
  ChevronDownIcon,
  ChevronLeftIcon,
  ChevronRightIcon,
  ChevronUpIcon,
  ClockIcon,
  MessageCircleIcon,
  MessageSquareIcon,
  PencilIcon,
  ThumbsUpIcon,
  Trash2Icon,
} from "lucide-react";
import { useTranslation } from "react-i18next";
import type { ProfilePostItem } from "../mockData";

const PAGE_SIZE = 2;

export type ProfilePostsSectionProps = {
  items: ProfilePostItem[];
  onComplete?: (item: ProfilePostItem) => void;
  onEdit?: (item: ProfilePostItem) => void;
  onDelete?: (item: ProfilePostItem) => void;
};

const ProfilePostsSection: React.FC<ProfilePostsSectionProps> = ({
  items,
  onComplete,
  onEdit,
  onDelete,
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
    <section className={`s-profile-section s-profile-section--posts${expanded ? " s-profile-section--expanded" : ""}`}>
      <button type="button" className="s-profile-section__header" onClick={toggleExpanded}>
        <span className="s-profile-section__header-left">
          <span className="s-profile-section__icon s-profile-section__icon--cyan">
            <MessageSquareIcon size={14} />
          </span>
          <span className="s-profile-section__title">{t("profile.myPosts.title")}</span>
          <span className="s-profile-section__badge s-profile-section__badge--cyan">{items.length}</span>
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
            <article key={item.id} className="s-profile-post">
              <h3 className="s-profile-post__title">{item.title}</h3>

              <p className="s-profile-post__content">{item.content}</p>

              <div className="s-profile-post__footer">
                <div className="s-profile-post__stats">
                  <span className="s-profile-post__stat">
                    <ThumbsUpIcon size={13} />
                    {item.likes}
                  </span>
                  <span className="s-profile-post__stat">
                    <MessageCircleIcon size={13} />
                    {item.comments}
                  </span>
                  <span className="s-profile-post__stat">
                    <ClockIcon size={13} />
                    {item.date}
                  </span>
                </div>

                <div className="s-profile-post__actions">
                  {item.status === "招募中" ? (
                    <button
                      type="button"
                      className="s-profile-post__action s-profile-post__action--complete"
                      aria-label={t("profile.myPosts.complete")}
                      onClick={() => onComplete?.(item)}
                    >
                      <CheckCircleIcon size={14} />
                    </button>
                  ) : null}
                  <button
                    type="button"
                    className="s-profile-post__action s-profile-post__action--edit"
                    aria-label={t("profile.myPosts.edit")}
                    onClick={() => onEdit?.(item)}
                  >
                    <PencilIcon size={14} />
                  </button>
                  <button
                    type="button"
                    className="s-profile-post__action s-profile-post__action--delete"
                    aria-label={t("profile.myPosts.delete")}
                    onClick={() => onDelete?.(item)}
                  >
                    <Trash2Icon size={14} />
                  </button>
                </div>
              </div>
            </article>
          ))}
        </div>
      ) : null}
    </section>
  );
};

export default ProfilePostsSection;
