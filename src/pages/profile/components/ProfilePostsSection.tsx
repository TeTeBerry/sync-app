import React from "react";
import {
  CheckIcon,
  CheckCircleIcon,
  ClockIcon,
  FlameIcon,
  HeartIcon,
  MessageCircleIcon,
  MessageSquareIcon,
  PencilIcon,
  SparklesIcon,
  Trash2Icon,
  XIcon,
} from "lucide-react";
import { useTranslation } from "react-i18next";
import { ProfileCollapsibleSection } from "../../../components/profile/ProfileCollapsibleSection";
import type { ProfilePostItem } from "../../types/backend";

const POST_BODY_MAX = 200;

function isPostEditDirty(
  item: ProfilePostItem,
  draft: ProfilePostEditDraft,
): boolean {
  const statusMatches =
    draft.status === "已组队"
      ? item.status === "已组队"
      : item.status === "招募中";
  return draft.body !== item.content || !statusMatches;
}

export type ProfilePostEditDraft = {
  body: string;
  status: "招募中" | "已组队";
};

export type ProfilePostsSectionProps = {
  items: ProfilePostItem[];
  editingPostId?: string | null;
  editDraft?: ProfilePostEditDraft | null;
  onSelect?: (item: ProfilePostItem) => void;
  onComplete?: (item: ProfilePostItem) => void;
  onEdit?: (item: ProfilePostItem) => void;
  onDelete?: (item: ProfilePostItem) => void;
  onEditDraftChange?: (draft: ProfilePostEditDraft) => void;
  onSaveEdit?: (item: ProfilePostItem) => void;
  onCancelEdit?: () => void;
};

const ProfilePostsSection: React.FC<ProfilePostsSectionProps> = ({
  items,
  editingPostId = null,
  editDraft = null,
  onSelect,
  onComplete,
  onEdit,
  onDelete,
  onEditDraftChange,
  onSaveEdit,
  onCancelEdit,
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
        pageItems.map((item) => {
          const isEditing = editingPostId === item.id;
          const draft = isEditing ? editDraft : null;
          const charCount = draft?.body.length ?? 0;
          const charProgress = Math.min(charCount / POST_BODY_MAX, 1);
          const isDirty =
            isEditing && draft ? isPostEditDirty(item, draft) : false;

          return (
            <article
              key={item.id}
              className={`s-profile-post s-profile-post--clickable${isEditing ? " s-profile-post--editing" : ""}`}
              role="button"
              tabIndex={0}
              onClick={() => onSelect?.(item)}
              onKeyDown={(event) => {
                if (event.key !== "Enter" && event.key !== " ") return;
                event.preventDefault();
                onSelect?.(item);
              }}
            >
              <div className="s-profile-post__head">
                <h3 className="s-profile-post__title">
                  <span className="s-profile-post__title-dot" aria-hidden />
                  {item.title}
                </h3>
                {item.status === "招募中" ? (
                  <span className="s-profile-post__status s-profile-post__status--recruiting">
                    {t("profile.myPosts.statusRecruiting")}
                  </span>
                ) : item.status === "已组队" ? (
                  <span className="s-profile-post__status s-profile-post__status--grouped">
                    {t("profile.myPosts.statusGrouped")}
                  </span>
                ) : null}
              </div>

              <p className="s-profile-post__content">{item.content}</p>

              <div className="s-profile-post__footer">
                <div className="s-profile-post__stats">
                  <span className="s-profile-post__stat">
                    <HeartIcon size={13} />
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
                      onClick={(event) => {
                        event.stopPropagation();
                        onComplete?.(item);
                      }}
                    >
                      <CheckCircleIcon size={14} />
                    </button>
                  ) : null}
                  <button
                    type="button"
                    className="s-profile-post__action s-profile-post__action--edit"
                    aria-label={t("profile.myPosts.edit")}
                    onClick={(event) => {
                      event.stopPropagation();
                      onEdit?.(item);
                    }}
                  >
                    <PencilIcon size={14} />
                  </button>
                  <button
                    type="button"
                    className="s-profile-post__action s-profile-post__action--delete"
                    aria-label={t("profile.myPosts.delete")}
                    onClick={(event) => {
                      event.stopPropagation();
                      onDelete?.(item);
                    }}
                  >
                    <Trash2Icon size={14} />
                  </button>
                </div>
              </div>

              {isEditing && draft ? (
                <div
                  className="s-profile-post-edit"
                  role="presentation"
                  onClick={(event) => event.stopPropagation()}
                >
                  <div className="s-profile-post-edit__header">
                    <span className="s-profile-post-edit__label">
                      <span className="s-profile-post-edit__label-icon" aria-hidden>
                        <PencilIcon size={14} />
                      </span>
                      {t("profile.myPosts.editTitle")}
                    </span>
                    <span className="s-profile-post-edit__event">{item.title}</span>
                  </div>

                  <div className="s-profile-post-edit__field">
                    <div className="s-profile-post-edit__textarea-wrap">
                      <textarea
                        className="s-profile-post-edit__textarea"
                        value={draft.body}
                        maxLength={POST_BODY_MAX}
                        rows={4}
                        onChange={(event) => {
                          onEditDraftChange?.({
                            ...draft,
                            body: event.target.value.slice(0, POST_BODY_MAX),
                          });
                        }}
                      />
                      <span className="s-profile-post-edit__counter">
                        {t("profile.myPosts.charCount", {
                          current: charCount,
                          max: POST_BODY_MAX,
                        })}
                      </span>
                    </div>
                    <div
                      className="s-profile-post-edit__progress"
                      role="progressbar"
                      aria-valuenow={charCount}
                      aria-valuemin={0}
                      aria-valuemax={POST_BODY_MAX}
                    >
                      <span
                        className="s-profile-post-edit__progress-fill"
                        style={{ width: `${charProgress * 100}%` }}
                      />
                    </div>
                  </div>

                  <p className="s-profile-post-edit__status-label">
                    {t("profile.myPosts.statusLabel")}
                  </p>
                  <div className="s-profile-post-edit__status-row">
                    <button
                      type="button"
                      className={`s-profile-post-edit__status-btn${
                        draft.status === "招募中"
                          ? " s-profile-post-edit__status-btn--active-recruiting"
                          : ""
                      }`}
                      onClick={() =>
                        onEditDraftChange?.({ ...draft, status: "招募中" })
                      }
                    >
                      <FlameIcon size={16} />
                      <span>{t("profile.myPosts.statusRecruiting")}</span>
                      {draft.status === "招募中" ? (
                        <span className="s-profile-post-edit__status-dot" />
                      ) : null}
                    </button>
                    <button
                      type="button"
                      className={`s-profile-post-edit__status-btn${
                        draft.status === "已组队"
                          ? " s-profile-post-edit__status-btn--active-grouped"
                          : ""
                      }`}
                      onClick={() =>
                        onEditDraftChange?.({ ...draft, status: "已组队" })
                      }
                    >
                      <CheckCircleIcon size={16} />
                      <span>{t("profile.myPosts.statusGrouped")}</span>
                      {draft.status === "已组队" ? (
                        <SparklesIcon
                          size={14}
                          className="s-profile-post-edit__status-sparkle"
                          aria-hidden
                        />
                      ) : null}
                    </button>
                  </div>

                  {isDirty ? (
                    <p className="s-profile-post-edit__dirty" role="status">
                      <span className="s-profile-post-edit__dirty-dot" aria-hidden />
                      {t("profile.myPosts.dirtyHint")}
                    </p>
                  ) : null}

                  <div className="s-profile-post-edit__actions">
                    <button
                      type="button"
                      className="s-profile-post-edit__save"
                      onClick={() => onSaveEdit?.(item)}
                    >
                      <CheckIcon size={16} />
                      {t("profile.myPosts.save")}
                    </button>
                    <button
                      type="button"
                      className="s-profile-post-edit__cancel"
                      onClick={() => onCancelEdit?.()}
                    >
                      <XIcon size={14} />
                      {t("profile.myPosts.cancel")}
                    </button>
                  </div>
                </div>
              ) : null}
            </article>
          );
        })
      }
    </ProfileCollapsibleSection>
  );
};

export default ProfilePostsSection;
