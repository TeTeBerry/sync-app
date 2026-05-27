import { memo } from "react";
import {
  CheckIcon,
  CheckCircle2Icon,
  HeartIcon,
  MessageCircleIcon,
  Share2Icon,
  Trash2Icon,
  UserPlusIcon,
} from "lucide-react";
import { PostActionMenu } from "../../../components/PostActionMenu";
import { PostCommentSection } from "../../../components/PostCommentSection";
import { PostStatusBadge } from "../../../components/PostStatusBadge";
import { ImageWithFallback } from "../../../components/ImageWithFallback";
import { ContentTypeBadge } from "../../../components/ContentTypeBadge";
import { PostImageGrid, PostImageCount } from "../../../components/PostImageGrid";
import { isCurrentUserPostAuthor } from "../../../utils/postOwnership";
import type { EventDetailPost } from "../../../types/backend";

export type EventPostCardProps = {
  post: EventDetailPost;
  publishTimeLabel: string;
  highlighted: boolean;
  commentsExpanded: boolean;
  applied: boolean;
  apiEnabled: boolean;
  currentUserAvatar?: string;
  onLike: (postId: string) => void;
  onToggleComments: (postId: string) => void;
  onDelete: (post: EventDetailPost) => void;
  onApply: (postId: string) => void;
  onComplete?: (postId: string) => void;
  onCommentSubmitted: () => void;
};

function EventPostCardInner({
  post,
  publishTimeLabel,
  highlighted,
  commentsExpanded,
  applied,
  apiEnabled,
  currentUserAvatar,
  onLike,
  onToggleComments,
  onDelete,
  onApply,
  onComplete,
  onCommentSubmitted,
}: EventPostCardProps) {
  const isOwn = isCurrentUserPostAuthor(post.name);

  return (
    <article
      className={`s-event-post${highlighted ? " s-event-post--highlight" : ""}`}
    >
      <div className="s-event-post__header">
        <ImageWithFallback
          src={post.avatar}
          alt={post.name}
          imageClassName="s-event-post__avatar"
          placeholderClassName="s-event-post__avatar s-event-post__avatar--placeholder"
          fallback={post.name.slice(0, 1)}
        />
        <div className="s-event-post__head-main">
          <div className="s-event-post__top">
            <p>
              <strong>{post.name}</strong>
              <span>
                {post.location} · {publishTimeLabel}
                {post.images?.length ? <PostImageCount count={post.images.length} /> : null}
              </span>
            </p>
            <div className="s-event-post__head-actions">
              <PostStatusBadge status={post.status} variant="event" />
              {!isOwn ? (
                <PostActionMenu postId={post.id} authorUserId={post.userId} />
              ) : null}
            </div>
          </div>
        </div>
      </div>

      <p className="s-event-post__text">{post.body}</p>

      {post.images?.length ? <PostImageGrid images={post.images} fullBleed /> : null}

      <ContentTypeBadge types={post.contentTypes} />

      <div className="s-event-post__tags">
        {post.tags.map((tag) => (
          <span key={tag} className="s-event-post__tag">
            {tag}
          </span>
        ))}
      </div>

      <div className="s-event-post__footer">
        <div className="s-event-post__actions">
          <button
            type="button"
            className={`s-event-post__action${post.liked ? " s-event-post__action--liked" : ""}`}
            onClick={() => onLike(post.id)}
            disabled={!apiEnabled}
          >
            <HeartIcon size={16} fill={post.liked ? "currentColor" : "none"} />
            {post.likes}
          </button>
          <button
            type="button"
            className={`s-event-post__action${commentsExpanded ? " s-event-post__action--active" : ""}`}
            onClick={() => onToggleComments(post.id)}
          >
            <MessageCircleIcon size={16} />
            {post.comments}
          </button>
          <button type="button" className="s-event-post__action">
            <Share2Icon size={16} />
          </button>
          {isOwn && post.status === "招募中" && onComplete ? (
            <button
              type="button"
              className="s-event-post__action s-event-post__action--complete"
              aria-label="标记为已组队"
              title="标记为已组队"
              onClick={() => onComplete(post.id)}
            >
              <CheckCircle2Icon size={16} />
              招募中
            </button>
          ) : null}
          {isOwn ? (
            <button
              type="button"
              className="s-event-post__action"
              aria-label="删除"
              onClick={() => onDelete(post)}
            >
              <Trash2Icon size={16} />
            </button>
          ) : null}
        </div>
        {!isOwn && post.status === "招募中" ? (
          applied ? (
            <button type="button" className="s-event-post__apply s-event-post__apply--done" disabled>
              <CheckIcon size={14} />
              已申请
            </button>
          ) : (
            <button type="button" className="s-event-post__apply" onClick={() => onApply(post.id)}>
              <UserPlusIcon size={14} />
              申请组队
            </button>
          )
        ) : null}
      </div>

      {commentsExpanded ? (
        <PostCommentSection
          postId={post.id}
          expanded
          onToggleExpanded={() => onToggleComments(post.id)}
          currentUserAvatar={currentUserAvatar}
          onCommentSubmitted={onCommentSubmitted}
        />
      ) : null}
    </article>
  );
}

export const EventPostCard = memo(EventPostCardInner);
