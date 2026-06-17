import { memo, useMemo } from 'react';
import { MapPin } from '../../../components/icons';
import {
  PostCardActionBar,
  PostCommentSection,
  PostOwnerDeleteButton,
} from '../../../components/post';
import { ImageWithFallback } from '../../../components/ImageWithFallback';
import { isCurrentUserPostAuthor } from '../../../utils/postOwnership';
import type { EventDetailPost } from '../../../types/backend';
import { stripPostBodyContact } from '../../../utils/postBodyContact';
import { formatEventPostHandle } from '../utils/eventPostDisplay';
import { Text, View } from '@tarojs/components';

export type EventPostCardProps = {
  post: EventDetailPost;
  publishTimeLabel: string;
  highlighted: boolean;
  commentsExpanded: boolean;
  currentUserAvatar?: string;
  onOpenComments: (postId: string) => void;
  onCloseComments: (postId: string) => void;
  onDelete?: (post: EventDetailPost) => void;
  onCommentSubmitted?: (updated: Pick<EventDetailPost, 'id' | 'comments'>) => void;
};

function EventPostCardInner({
  post,
  publishTimeLabel,
  highlighted,
  commentsExpanded,
  currentUserAvatar,
  onOpenComments,
  onCloseComments,
  onDelete,
  onCommentSubmitted,
}: EventPostCardProps) {
  const displayBody = useMemo(() => stripPostBodyContact(post.body), [post.body]);
  const submetaLocation = post.location?.trim() ?? '';

  const postName = post.name?.trim() || '用户';
  const isOwn = isCurrentUserPostAuthor(postName, post.userId);

  const stopClickPropagation = (event: { stopPropagation?: () => void }) => {
    event.stopPropagation?.();
  };

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
            {isOwn && onDelete ? (
              <View
                className="s-event-post__head-actions"
                onClick={stopClickPropagation}
              >
                <PostOwnerDeleteButton onDelete={() => onDelete(post)} />
              </View>
            ) : null}
          </View>
        </View>
      </View>

      {displayBody ? <Text className="s-event-post__text">{displayBody}</Text> : null}

      <View className="s-event-post__footer">
        <View className="s-event-post__footer-divider" aria-hidden />
        <View className="s-event-post__footer-row">
          <View className="s-event-post__footer-left">
            <PostCardActionBar
              comments={post.comments ?? 0}
              commentsExpanded={commentsExpanded}
              onToggleComments={() =>
                commentsExpanded ? onCloseComments(post.id) : onOpenComments(post.id)
              }
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
          onToggleExpanded={() => onCloseComments(post.id)}
          currentUserAvatar={currentUserAvatar}
          onCommentSubmitted={onCommentSubmitted}
        />
      ) : null}
    </View>
  );
}

export const EventPostCard = memo(EventPostCardInner);
