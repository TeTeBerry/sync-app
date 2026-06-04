import { memo } from 'react';
import { CircleCheck, MapPin, Users, Zap } from '../../../../components/icons';
import PostCardActionBar from '../../../../components/post/PostCardActionBar';
import { buildPostSharePayload } from '../../../../components/post/postCardShare';
import {
  PostActionMenu,
  PostCommentSection,
  PostShareButton,
  PostStatusBadge,
} from '../../../../components/post';
import { ImageWithFallback } from '../../../../components/ImageWithFallback';
import {
  ContentTypeBadge,
  filterContentTypeTags,
  mergePostContentTypes,
  PostTagBadge,
  stripContentTypeHashtags,
} from '../../../../components/post';
import { PostImageGrid } from '../../../../components/post';
import { EVENT_POST_IMAGE_MAX_DISPLAY } from '../../../../constants/listPerf';
import { isApiEnabled } from '../../../../constants/api';
import { isCurrentUserPostAuthor } from '../../../../utils/postOwnership';
import type { EventDetailPost } from '../../../../types/backend';
import {
  formatEventPostHandle,
  parseGroupProgressFromText,
} from '../utils/eventPostDisplay';
import { Button } from '../../../../components/ui';
import { OnSiteVerifiedBadge } from '../../../../components/OnSiteVerifiedBadge';
import { Text, View } from '@tarojs/components';

export type EventPostCardProps = {
  post: EventDetailPost;
  activityLegacyId: number;
  publishTimeLabel: string;
  highlighted: boolean;
  commentsExpanded: boolean;
  applied: boolean;
  currentUserAvatar?: string;
  onLike: (postId: string) => void;
  onToggleComments: (postId: string) => void;
  onDelete: (post: EventDetailPost) => void;
  onApply: (postId: string) => void;
  onComplete?: (postId: string) => void;
  onCommentSubmitted: (
    updated: Pick<EventDetailPost, 'id' | 'comments' | 'likes' | 'liked'>,
  ) => void;
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

function EventPostCardInner({
  post,
  activityLegacyId,
  publishTimeLabel,
  highlighted,
  commentsExpanded,
  applied,
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
                {post.authorOnSiteVerified ? <OnSiteVerifiedBadge /> : null}
                <Text className="s-event-post__user-handle">
                  {formatEventPostHandle(postName)}
                </Text>
              </View>
              <View className="s-event-post__submeta">
                <MapPin size={12} color="#8e8e93" aria-hidden />
                <Text className="s-event-post__submeta-text">
                  {submetaLocation ? `${submetaLocation} · ` : ''}
                  {publishTimeLabel}
                </Text>
              </View>
            </View>
            <View className="s-event-post__head-actions">
              <PostStatusBadge post={post} variant="event" isOwn={isOwn} />
              <PostShareButton
                share={buildPostSharePayload({
                  postId: post.id,
                  activityLegacyId,
                  body: post.body,
                  authorName: post.name,
                  images: post.images,
                  avatar: post.avatar,
                })}
              />
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

      {post.images?.length ? (
        <PostImageGrid images={post.images} maxDisplay={EVENT_POST_IMAGE_MAX_DISPLAY} />
      ) : null}

      {contentTypeKeys.length || groupProgress || isCompleted || displayTags.length ? (
        <View className="s-event-post__meta-row">
          {contentTypeKeys.length ? (
            <ContentTypeBadge
              types={contentTypeKeys}
              className="s-event-post__content-badges"
            />
          ) : null}
          {groupProgress ? (
            <GroupProgressRow
              current={groupProgress.current}
              total={groupProgress.total}
            />
          ) : null}
          {isCompleted ? <PostTagBadge tag="#已满" /> : null}
          {displayTags.map((tag) => (
            <PostTagBadge key={tag} tag={tag} />
          ))}
        </View>
      ) : null}

      <View className="s-event-post__footer">
        <View className="s-event-post__footer-divider" aria-hidden />
        <View className="s-event-post__footer-row">
          <View className="s-event-post__footer-left">
            <PostCardActionBar
              variant="event"
              liked={Boolean(post.liked)}
              likes={post.likes}
              comments={post.comments}
              commentsExpanded={commentsExpanded}
              onLike={() => onLike(post.id)}
              onToggleComments={() => onToggleComments(post.id)}
              likeDisabled={!isApiEnabled()}
            />
          </View>

          {showApply ? (
            applied ? (
              <Button className="s-event-post__cta s-event-post__cta--applied" disabled>
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
