import "./PostCommentSection.scss";
import Taro from "@tarojs/taro";
import { useCallback, useState, type FC } from "react";
import { ChevronUpIcon, HeartIcon, SendIcon } from "lucide-react";
import { useTranslation } from "react-i18next";
import { useQueryClient } from "@tanstack/react-query";
import { commentPostAndInvalidate, usePostCommentsQuery } from "../hooks/useSyncApi";
import { isApiEnabled } from "../constants/api";

const DEFAULT_AVATAR =
  "https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=200&q=80";

export type PostCommentSectionProps = {
  postId: string;
  expanded: boolean;
  onToggleExpanded: () => void;
  currentUserAvatar?: string;
  onCommentSubmitted?: () => void;
};

export const PostCommentSection: FC<PostCommentSectionProps> = ({
  postId,
  expanded,
  onToggleExpanded,
  currentUserAvatar,
  onCommentSubmitted,
}) => {
  const { t } = useTranslation();
  const queryClient = useQueryClient();
  const apiEnabled = isApiEnabled();
  const commentsQuery = usePostCommentsQuery(postId, expanded);
  const [draft, setDraft] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [likedCommentIds, setLikedCommentIds] = useState<Set<string>>(() => new Set());

  const handleSubmit = useCallback(() => {
    const body = draft.trim();
    if (!body || submitting) return;

    if (!apiEnabled) {
      void Taro.showToast({ title: t("home.feed.apiRequired"), icon: "none" });
      return;
    }

    setSubmitting(true);
    void commentPostAndInvalidate(queryClient, postId, body)
      .then(() => {
        setDraft("");
        onCommentSubmitted?.();
        void Taro.showToast({ title: t("home.feed.commentSuccess"), icon: "success" });
      })
      .catch(() => void Taro.showToast({ title: t("home.feed.commentFailed"), icon: "none" }))
      .finally(() => setSubmitting(false));
  }, [apiEnabled, draft, onCommentSubmitted, postId, queryClient, submitting, t]);

  const toggleCommentLike = useCallback((commentId: string) => {
    setLikedCommentIds((prev) => {
      const next = new Set(prev);
      if (next.has(commentId)) {
        next.delete(commentId);
      } else {
        next.add(commentId);
      }
      return next;
    });
  }, []);

  const userAvatar = currentUserAvatar?.trim() || DEFAULT_AVATAR;
  const comments = commentsQuery.data ?? [];

  if (!expanded) return null;

  return (
    <section className="s-post-comments" aria-label={t("eventDetail.comments.sectionLabel")}>
      <div className="s-post-comments__list">
        {commentsQuery.isLoading ? (
          <p className="s-post-comments__status">{t("common.loading")}</p>
        ) : commentsQuery.isError ? (
          <p className="s-post-comments__status">{t("eventDetail.comments.loadError")}</p>
        ) : comments.length === 0 ? (
          <p className="s-post-comments__status">{t("eventDetail.comments.empty")}</p>
        ) : (
          comments.map((comment) => {
            const liked = likedCommentIds.has(comment.id);

            return (
              <article key={comment.id} className="s-post-comments__item">
                <img
                  className="s-post-comments__avatar"
                  src={comment.avatar || DEFAULT_AVATAR}
                  alt=""
                />
                <div className="s-post-comments__body-wrap">
                  <div className="s-post-comments__meta">
                    <strong>{comment.authorName}</strong>
                    <span>{comment.time}</span>
                  </div>
                  <p className="s-post-comments__bubble">{comment.body}</p>
                  <button
                    type="button"
                    className={`s-post-comments__like${liked ? " s-post-comments__like--active" : ""}`}
                    onClick={() => toggleCommentLike(comment.id)}
                  >
                    <HeartIcon size={12} fill={liked ? "currentColor" : "none"} />
                    {t("eventDetail.comments.like")}
                  </button>
                </div>
              </article>
            );
          })
        )}
      </div>

      <div className="s-post-comments__composer">
        <img className="s-post-comments__avatar" src={userAvatar} alt="" />
        <div className="s-post-comments__input-wrap">
          <input
            className="s-post-comments__input"
            value={draft}
            placeholder={t("eventDetail.comments.placeholder")}
            onChange={(e) => setDraft(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === "Enter" && draft.trim()) handleSubmit();
            }}
          />
          <button
            type="button"
            className="s-post-comments__send"
            aria-label={t("eventDetail.comments.send")}
            disabled={!draft.trim() || submitting}
            onClick={handleSubmit}
          >
            <SendIcon size={14} />
          </button>
        </div>
      </div>

      <button type="button" className="s-post-comments__toggle" onClick={onToggleExpanded}>
        {t("eventDetail.comments.collapse")}
        <ChevronUpIcon size={14} />
      </button>
    </section>
  );
};
