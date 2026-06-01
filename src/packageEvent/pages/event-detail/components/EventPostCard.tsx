import { memo } from 'react';
import {
  Check,
  CircleCheck,
  Heart,
  MapPin,
  MessageCircle,
  Users,
  Zap,
} from 'lucide-react-taro';
import { PostActionMenu, PostShareButton } from '../../../../components/PostActionMenu';
import { PostCommentSection } from '../../../../components/PostCommentSection';
import { PostStatusBadge } from '../../../../components/PostStatusBadge';
import { ImageWithFallback } from '../../../../components/ImageWithFallback';
import {
  filterContentTypeTags,
  mergePostContentTypes,
  stripContentTypeHashtags,
} from '../../../../components/ContentTypeBadge';
import {
  formatContentTypeHashtag,
  resolveContentTypeKey,
} from '../../../../utils/postContentTypeDisplay';
import { PostImageGrid, PostImageCount } from '../../../../components/PostImageGrid';
import { isCurrentUserPostAuthor } from '../../../../utils/postOwnership';
import { postActionIconColor } from '../../../../utils/postActionColors';
import type { PostSharePayload } from '../../../../utils/postShare';
import type { EventDetailPost } from '../../../../types/backend';
import {
  formatEventPostHandle,
  parseGroupProgressFromText,
} from '../utils/eventPostDisplay';
import { Button } from '../../../../components/ui';
import { Text, View } from '@tarojs/components';

export type EventPostCardProps = {
  post: EventDetailPost;
  activityLegacyId: number;
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

function GroupProgressRow({ current, total }: { current: number; total: number }) {
  return (
    <View className="s-event-post__progress">
      {Array.from({ length: total }, (_, index) => (
        <View
          key={index}
          className={[
            's-event-post__progress-dot',
            index < current && 's-event-post__progress-dot--filled',
          ]
            .filter(Boolean)
            .join(' ')}
        />
      ))}
      <Text className="s-event-post__progress-label">
        {current}/{total}
      </Text>
    </View>
  );
}

function eventPostSharePayload(
  post: EventDetailPost,
  activityLegacyId: number,
): PostSharePayload {
  return {
    postId: post.id,
    activityLegacyId,
    body: post.body,
    authorName: post.name,
    images: post.images,
    imageUrl: post.images?.[0] ?? post.avatar,
  };
}

function EventPostCardInner({
  post,
  activityLegacyId,
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
  const postName = post.name?.trim() || '用户';
  const postTags = post.tags ?? [];
  const isOwn = isCurrentUserPostAuthor(postName, post.userId);
  const isRecruiting = post.status === '招募中';
  const isCompleted = post.status === '已组队';
  const contentTypeKeys = mergePostContentTypes(post.contentTypes, {
    body: post.body,
    tags: postTags,
  });
  const bodyText = stripContentTypeHashtags(post.body);
  const displayTags = filterContentTypeTags(postTags, contentTypeKeys);
  const primaryTypeKey = contentTypeKeys[0];
  const groupProgress =
    isRecruiting && bodyText
      ? parseGroupProgressFromText(`${bodyText} ${postTags.join(' ')}`)
      : null;
  const showApply = !isOwn && isRecruiting;
  const submetaLocation = post.location?.trim() ?? '';

  const cardMod = isCompleted
    ? 's-event-post--completed'
    : isRecruiting
      ? 's-event-post--recruiting'
      : '';

  return (
    <View
      className={['s-event-post', cardMod, highlighted && 's-event-post--highlight']
        .filter(Boolean)
        .join(' ')}
    >
      <View className="s-event-post__header">
        <View className="s-event-post__avatar-wrap">
          <ImageWithFallback
            src={post.avatar}
            alt={postName}
            imageClassName="s-event-post__avatar"
            placeholderClassName="s-event-post__avatar s-event-post__avatar--placeholder"
            fallback={postName.slice(0, 1)}
          />
          {isRecruiting ? (
            <View
              className="s-event-post__avatar-badge s-event-post__avatar-badge--recruit"
              aria-hidden
            >
              <Zap size={10} color="#fff" />
            </View>
          ) : null}
          {isCompleted ? (
            <View
              className="s-event-post__avatar-badge s-event-post__avatar-badge--done"
              aria-hidden
            >
              <CircleCheck size={10} color="#fff" />
            </View>
          ) : null}
        </View>
        <View className="s-event-post__head-main">
          <View className="s-event-post__top">
            <View className="s-event-post__identity">
              <View className="s-event-post__name-row">
                <Text className="s-event-post__user-name">{postName}</Text>
                <Text className="s-event-post__user-handle">
                  {formatEventPostHandle(postName)}
                </Text>
              </View>
              <View className="s-event-post__submeta">
                <MapPin size={12} color="#8e8e93" aria-hidden />
                <Text className="s-event-post__submeta-text">
                  {submetaLocation ? `${submetaLocation} · ` : ''}
                  {publishTimeLabel}
                  {post.images?.length ? (
                    <PostImageCount count={post.images.length} />
                  ) : null}
                </Text>
              </View>
            </View>
            <View className="s-event-post__head-actions">
              <PostStatusBadge post={post} variant="event" isOwn={isOwn} />
              <PostShareButton share={eventPostSharePayload(post, activityLegacyId)} />
              {isOwn ? (
                <PostActionMenu
                  postId={post.id}
                  authorUserId={post.userId}
                  onDelete={() => onDelete(post)}
                />
              ) : (
                <PostActionMenu postId={post.id} authorUserId={post.userId} />
              )}
            </View>
          </View>
        </View>
      </View>

      {bodyText ? <Text className="s-event-post__text">{bodyText}</Text> : null}

      {post.images?.length ? <PostImageGrid images={post.images} /> : null}

      {primaryTypeKey || groupProgress || isCompleted || displayTags.length ? (
        <View className="s-event-post__meta-row">
          {primaryTypeKey ? (
            <Text
              className={[
                's-event-post__type-tag',
                `s-event-post__type-tag--${resolveContentTypeKey(primaryTypeKey)}`,
              ].join(' ')}
            >
              {formatContentTypeHashtag(primaryTypeKey)}
            </Text>
          ) : null}
          {groupProgress ? (
            <GroupProgressRow
              current={groupProgress.current}
              total={groupProgress.total}
            />
          ) : null}
          {isCompleted ? (
            <Text className="s-event-post__tag s-event-post__tag--full">#已满</Text>
          ) : null}
          {displayTags.map((tag) => (
            <Text key={tag} className="s-event-post__tag s-event-post__tag--extra">
              {tag.startsWith('#') ? tag : `#${tag}`}
            </Text>
          ))}
        </View>
      ) : null}

      <View className="s-event-post__footer">
        <View className="s-event-post__footer-divider" aria-hidden />
        <View className="s-event-post__footer-row">
          <View className="s-event-post__footer-left">
            <View className="s-event-post__actions">
              <Button
                className={[
                  's-event-post__action',
                  post.liked && 's-event-post__action--liked',
                ]
                  .filter(Boolean)
                  .join(' ')}
                onClick={() => onLike(post.id)}
                disabled={!apiEnabled}
              >
                <Heart
                  size={16}
                  filled={post.liked}
                  color={postActionIconColor({ liked: post.liked })}
                />
                <Text className="s-event-post__action-label">{post.likes}</Text>
              </Button>
              <Button
                className={[
                  's-event-post__action',
                  commentsExpanded && 's-event-post__action--active',
                ]
                  .filter(Boolean)
                  .join(' ')}
                onClick={() => onToggleComments(post.id)}
              >
                <MessageCircle
                  size={16}
                  color={postActionIconColor({ active: commentsExpanded })}
                />
                <Text className="s-event-post__action-label">{post.comments}</Text>
              </Button>
            </View>
          </View>

          {showApply ? (
            applied ? (
              <Button className="s-event-post__cta s-event-post__cta--applied" disabled>
                <Check size={14} color="#ccc" aria-hidden />
                <Text className="s-event-post__cta-text">已申请</Text>
              </Button>
            ) : (
              <Button
                className="s-event-post__cta s-event-post__cta--apply"
                onClick={() => onApply(post.id)}
              >
                <Users size={14} color="#fff" aria-hidden />
                <Text className="s-event-post__cta-text">申请组队</Text>
              </Button>
            )
          ) : null}
          {isOwn && isRecruiting && onComplete ? (
            <Button
              className="s-event-post__cta s-event-post__cta--manage"
              onClick={() => onComplete(post.id)}
            >
              <CircleCheck size={14} color="#34c759" aria-hidden />
              <Text className="s-event-post__cta-text">标记完成</Text>
            </Button>
          ) : null}
        </View>
      </View>

      {commentsExpanded ? (
        <PostCommentSection
          postId={post.id}
          postAuthorName={post.name}
          postAuthorUserId={post.userId}
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
