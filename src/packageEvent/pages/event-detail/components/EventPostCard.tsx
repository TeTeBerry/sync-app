import { memo } from "react";
import { Check, CircleCheck, Heart, MessageCircle, Share2, Trash2, UserPlus } from "lucide-react-taro";
import { PostActionMenu } from "../../../../components/PostActionMenu";
import { PostCommentSection } from "../../../../components/PostCommentSection";
import { PostStatusBadge } from "../../../../components/PostStatusBadge";
import { ImageWithFallback } from "../../../../components/ImageWithFallback";
import {
  ContentTypeBadge,
  filterContentTypeTags,
  mergePostContentTypes,
  stripContentTypeHashtags,
} from "../../../../components/ContentTypeBadge";
import { PostImageGrid, PostImageCount } from "../../../../components/PostImageGrid";
import { isCurrentUserPostAuthor } from "../../../../utils/postOwnership";
import { postActionIconColor } from "../../../../utils/postActionColors";
import type { EventDetailPost } from "../../../../types/backend";
import { Button, Text, View } from '@tarojs/components';

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
  const isOwn = isCurrentUserPostAuthor(post.name, post.userId);
  const contentTypeKeys = mergePostContentTypes(post.contentTypes, {
    body: post.body,
    tags: post.tags,
  });
  const bodyText = stripContentTypeHashtags(post.body);
  const displayTags = filterContentTypeTags(post.tags, contentTypeKeys);

  return (
    <View
      className={`s-event-post${highlighted ? " s-event-post--highlight" : ""}`}>
      <View className="s-event-post__header">
        <ImageWithFallback
          src={post.avatar}
          alt={post.name}
          imageClassName="s-event-post__avatar"
          placeholderClassName="s-event-post__avatar s-event-post__avatar--placeholder"
          fallback={post.name.slice(0, 1)}
        />
        <View className="s-event-post__head-main">
          <View className="s-event-post__top">
            <Text className="s-event-post__user-line">
              <Text className="s-event-post__user-name">{post.name}</Text>
              <Text className="s-event-post__user-meta">
                {post.location} · {publishTimeLabel}
                {post.images?.length ? <PostImageCount count={post.images.length} /> : null}
              </Text>
            </Text>
            <View className="s-event-post__head-actions">
              <PostStatusBadge status={post.status} variant="event" isOwn={isOwn} />
              {!isOwn ? (
                <PostActionMenu postId={post.id} authorUserId={post.userId} />
              ) : null}
            </View>
          </View>
        </View>
      </View>

      {bodyText ? <Text className="s-event-post__text">{bodyText}</Text> : null}

      {post.images?.length ? <PostImageGrid images={post.images} /> : null}

      <ContentTypeBadge types={contentTypeKeys} />

      {displayTags.length ? (
        <View className="s-event-post__tags">
          {displayTags.map((tag) => (
            <Text key={tag} className="s-event-post__tag">
              {tag}
            </Text>
          ))}
        </View>
      ) : null}

      <View className="s-event-post__footer">
        <View className="s-event-post__actions">
          <Button className={`s-event-post__action${post.liked ? " s-event-post__action--liked" : ""}`}
            onClick={() => onLike(post.id)}
            disabled={!apiEnabled}>
            <Heart
              size={16}
              filled={post.liked}
              color={postActionIconColor({ liked: post.liked })}
            />
            <Text className="s-event-post__action-label">{post.likes}</Text>
          </Button>
          <Button className={`s-event-post__action${commentsExpanded ? " s-event-post__action--active" : ""}`}
            onClick={() => onToggleComments(post.id)}>
            <MessageCircle
              size={16}
              color={postActionIconColor({ active: commentsExpanded })}
            />
            <Text className="s-event-post__action-label">{post.comments}</Text>
          </Button>
          <Button className="s-event-post__action">
            <Share2 size={16} color={postActionIconColor({})} />
          </Button>
          {isOwn && post.status === "招募中" && onComplete ? (
            <Button className="s-event-post__action s-event-post__action--complete"
              aria-label="标记为已组队"
              title="标记为已组队"
              onClick={() => onComplete(post.id)}>
              <CircleCheck size={16} color="#34c759" />
              <Text className="s-event-post__action-label">招募中</Text>
            </Button>
          ) : null}
          {isOwn ? (
            <Button className="s-event-post__action"
              aria-label="删除"
              onClick={() => onDelete(post)}>
              <Trash2 size={16} color={postActionIconColor({})} />
            </Button>
          ) : null}
        </View>
        {!isOwn && post.status === "招募中" ? (
          applied ? (
            <Button className="s-event-post__apply s-event-post__apply--done" disabled>
              <Check size={14} />
              <Text className="s-event-post__apply-text">已申请</Text>
            </Button>
          ) : (
            <Button className="s-event-post__apply" onClick={() => onApply(post.id)}>
              <UserPlus size={14} />
              <Text className="s-event-post__apply-text">申请组队</Text>
            </Button>
          )
        ) : null}
      </View>

      {commentsExpanded ? (
        <PostCommentSection
          postId={post.id}
          expanded
          onToggleExpanded={() => onToggleComments(post.id)}
          currentUserAvatar={currentUserAvatar}
          onCommentSubmitted={onCommentSubmitted}
        />
      ) : null}
    </View>
  );
}

export const EventPostCard = memo(EventPostCardInner);
