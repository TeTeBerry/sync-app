import React from "react";
import {
  CheckCircleIcon,
  ClockIcon,
  MessageCircleIcon,
  MessageSquareIcon,
  PencilIcon,
  ThumbsUpIcon,
  Trash2Icon,
} from "lucide-react";
import { useTranslation } from "react-i18next";
import { ProfileCollapsibleSection } from "../../../components/profile/ProfileCollapsibleSection";
import type { ProfilePostItem } from "../mockData";

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

  return (
    <ProfileCollapsibleSection
      variant="posts"
      icon={<MessageSquareIcon size={14} />}
      title={t("profile.myPosts.title")}
      items={items}
    >
      {(pageItems) =>
        pageItems.map((item) => (
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
        ))
      }
    </ProfileCollapsibleSection>
  );
};

export default ProfilePostsSection;
