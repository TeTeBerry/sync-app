import { memo } from 'react';
import { MapPin } from '../../../components/icons';
import PostCardActionBar from '../../../components/post/PostCardActionBar';
import { buildPostSharePayload } from '../../../components/post/postCardShare';
import {
  PostActionMenu,
  PostCommentSection,
  PostShareButton,
} from '../../../components/post';
import { ImageWithFallback } from '../../../components/ImageWithFallback';
import { PostImageGrid } from '../../../components/post';
import { EVENT_POST_IMAGE_MAX_DISPLAY } from '../../../constants/listPerf';
import { isApiEnabled } from '../../../constants/api';
import { isCurrentUserPostAuthor } from '../../../utils/postOwnership';
import type { EventDetailPost } from '../../../types/backend';
import { formatEventPostHandle } from '../utils/eventPostDisplay';
import { OnSiteVerifiedBadge } from '../../../components/OnSiteVerifiedBadge';
import { Text, View } from '@tarojs/components';

export type EventPostCardProps = {
  post: EventDetailPost;
  activityLegacyId: number;
  publishTimeLabel: string;
  highlighted: boolean;
  commentsExpanded: boolean;
  currentUserAvatar?: string;
  onLike: (postId: string) => void;
  onToggleComments: (postId: string) => void;
  onDelete: (post: EventDetailPost) => void;
  onCommentSubmitted: (
    updated: Pick<EventDetailPost, 'id' | 'comments' | 'likes' | 'liked'>,
  ) => void;
};

function EventPostCardInner({
  post,
  activityLegacyId,
  publishTimeLabel,
  highlighted,
  commentsExpanded,
  currentUserAvatar,
  onLike,
  onToggleComments,
  onDelete,
  onCommentSubmitted,
}: EventPostCardProps) {
  const postName = post.name?.trim() || '用户';
  const isOwn = isCurrentUserPostAuthor(postName, post.userId);
  const bodyText = post.body?.trim() ?? '';
  const submetaLocation = post.location?.trim() ?? '';

  return (
    <View
      className={['s-event-post', highlighted && 's-event-post--highlight']
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
