import "./AiAssistantPostCard.scss";
import { MapPinIcon } from "lucide-react";
import type { FC } from "react";
import { useTranslation } from "react-i18next";
import type { RecommendedPostCard } from "../types/aiChat";
import { inferAuthorGenderFromPost } from "../utils/inferAuthorGender";
import { goEventDetail } from "../utils/route";

export type AiAssistantPostCardProps = {
  post: RecommendedPostCard;
};

export const AiAssistantPostCard: FC<AiAssistantPostCardProps> = ({ post }) => {
  const { t } = useTranslation();
  const authorGender = inferAuthorGenderFromPost(post);
  const nameClassName = authorGender
    ? `s-ai-assistant-post-card__name s-ai-assistant-post-card__name--${authorGender}`
    : "s-ai-assistant-post-card__name";

  const handleOpen = () => {
    const activityId = post.activityLegacyId;
    if (activityId != null && !Number.isNaN(activityId)) {
      goEventDetail(activityId, { postId: post.postId });
    }
  };

  return (
    <button type="button" className="s-ai-assistant-post-card" onClick={handleOpen}>
      <div className="s-ai-assistant-post-card__header">
        {post.authorAvatar ? (
          <img
            className="s-ai-assistant-post-card__avatar"
            src={post.authorAvatar}
            alt=""
          />
        ) : (
          <span className="s-ai-assistant-post-card__avatar s-ai-assistant-post-card__avatar--fallback">
            {post.authorName.slice(0, 1)}
          </span>
        )}
        <div className="s-ai-assistant-post-card__meta">
          <strong className={nameClassName}>{post.authorName}</strong>
          {post.authorHandle ? <span>{post.authorHandle}</span> : null}
          <small>{post.eventTitle}</small>
        </div>
      </div>
      <p className="s-ai-assistant-post-card__body">{post.snippet}</p>
      {post.location ? (
        <p className="s-ai-assistant-post-card__location">
          <MapPinIcon size={12} />
          <span>{post.location}</span>
        </p>
      ) : null}
      {post.tags?.length ? (
        <div className="s-ai-assistant-post-card__tags">
          {post.tags.slice(0, 3).map((tag) => (
            <span key={tag}>{tag}</span>
          ))}
        </div>
      ) : null}
      <span className="s-ai-assistant-post-card__cta">
        {t("aiAssistant.chat.viewPost")}
      </span>
    </button>
  );
};

export default AiAssistantPostCard;
