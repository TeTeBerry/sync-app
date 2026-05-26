import "./FeedPostList.scss";
import {
  MapPinIcon,
  MessageCircleIcon,
  Share2Icon,
  ThumbsUpIcon,
  Trash2Icon,
} from "lucide-react";
import { useCallback, useState, type FC } from "react";
import { useTranslation } from "react-i18next";
import { Button } from "./ui";
import { MetaRow } from "./MetaRow";
import { PostCommentSection } from "./PostCommentSection";
import { PostActionMenu } from "./PostActionMenu";
import { PostStatusBadge } from "./PostStatusBadge";
import { useCurrentUserQuery } from "../hooks/useSyncApi";
import { isCurrentUserPostAuthor } from "../utils/postOwnership";
import type { ActivityPost } from "../pages/index/homeData";

export type FeedPostListProps = {
  items: ActivityPost[];
  onDelete?: (post: ActivityPost) => void;
  onLike?: (post: ActivityPost) => void;
  onCommentSubmitted?: () => void;
};

export const FeedPostList: FC<FeedPostListProps> = ({
  items,
  onDelete,
  onLike,
  onCommentSubmitted,
}) => {
  const { t } = useTranslation();
  const { data: currentUser } = useCurrentUserQuery();
  const [expandedCommentPostIds, setExpandedCommentPostIds] = useState<Set<string>>(
    () => new Set(),
  );

  const togglePostComments = useCallback((postId: string) => {
    setExpandedCommentPostIds((prev) => {
      const next = new Set(prev);
      if (next.has(postId)) {
        next.delete(postId);
      } else {
        next.add(postId);
      }
      return next;
    });
  }, []);

  return (
    <div className="s-feed-post-list">
      {items.map((post) => {
        const isOwn = isCurrentUserPostAuthor(post.name);
        const commentsExpanded = expandedCommentPostIds.has(post.id);

        return (
          <article key={post.id} className="s-home-post">
            <div className="s-home-post__header">
              <img className="s-home-post__avatar" src={post.avatar} alt="" />
              <div className="s-home-post__head-main">
                <div className="s-home-post__top">
                  <p>
                    <strong>{post.name}</strong>
                    <span>{post.handle}</span>
                  </p>
                  <div className="s-home-post__head-actions">
                    <PostStatusBadge status={post.status} variant="home" />
                    {!isOwn ? (
                      <PostActionMenu postId={post.id} authorUserId={post.userId} />
                    ) : null}
                  </div>
                </div>
                <h3>{post.event}</h3>
                <small className="s-home-post__location">
                  <MetaRow icon={<MapPinIcon size={13} />}>{post.location}</MetaRow>
                </small>
              </div>
            </div>

            <p className="s-home-post__text">{post.body}</p>

            <div className="s-home-post__footer">
              <span className="s-home-post__time">{post.time}</span>
              <div className="s-home-post__actions">
                <Button
                  className={`s-home-post__action${post.liked ? " s-home-post__action--liked" : ""}`}
                  onClick={() => onLike?.(post)}
                >
                  <ThumbsUpIcon size={16} fill={post.liked ? "currentColor" : "none"} />
                  {post.likes}
                </Button>
                <Button
                  className={`s-home-post__action${commentsExpanded ? " s-home-post__action--active" : ""}`}
                  onClick={() => togglePostComments(post.id)}
                >
                  <MessageCircleIcon size={16} />
                  {post.comments}
                </Button>
                <Button className="s-home-post__action">
                  <Share2Icon size={16} />
                  {t("common.share")}
                </Button>
                {isOwn && onDelete ? (
                  <Button className="s-home-post__action" onClick={() => onDelete(post)}>
                    <Trash2Icon size={16} />
                    {t("profile.myPosts.delete")}
                  </Button>
                ) : null}
              </div>
            </div>

            <PostCommentSection
              postId={post.id}
              expanded={commentsExpanded}
              onToggleExpanded={() => togglePostComments(post.id)}
              currentUserAvatar={currentUser?.avatar}
              onCommentSubmitted={onCommentSubmitted}
            />
          </article>
        );
      })}
    </div>
  );
};
