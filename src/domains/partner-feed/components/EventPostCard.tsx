import { memo, useMemo } from 'react';
import { MapPin } from '../../../components/icons';
import {
  PostCardActionBar,
  PostCommentSection,
  PostOwnerDeleteButton,
} from '../../../components/post';
import { ContentReportMenuButton } from '../../../components/report';
import { ImageWithFallback } from '../../../components/ImageWithFallback';
import { useDisplayUserIdentity } from '../../../hooks/useDisplayUserIdentity';
import { useResolvedAvatarSrc } from '../../../hooks/useResolvedAvatarSrc';
import { resolveAvatarDisplaySrc, thumbnailImageUrl } from '../../../utils/imageUrl';
import { IMAGE_SIZE } from '../../../constants/imageSizes';
import { isCurrentUserPostAuthor } from '../../../utils/postOwnership';
import type { EventDetailPost } from '../../../types/backend';
import { stripPostBodyContact } from '../../../utils/postBodyContact';
import { formatPostHandle } from '../utils/eventPostDisplay';
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
  const displayIdentity = useDisplayUserIdentity();
  const displayBody = useMemo(() => stripPostBodyContact(post.body), [post.body]);
  const submetaLocation = post.location?.trim() ?? '';

  const isOwn = isCurrentUserPostAuthor(post.name, post.userId);

  const postName = isOwn
    ? displayIdentity.name?.trim() || post.name?.trim() || '用户'
    : post.name?.trim() || '用户';

  const postHandle = formatPostHandle(
    postName,
    isOwn ? displayIdentity.handle : post.handle,
  );

  const avatarKey = isOwn ? displayIdentity.avatar?.trim() || post.avatar : post.avatar;
  const resolvedAvatarSrc = useResolvedAvatarSrc(avatarKey);
  const avatarSrc = resolveAvatarDisplaySrc(
    resolvedAvatarSrc,
    thumbnailImageUrl(avatarKey, IMAGE_SIZE.avatarSm) ?? avatarKey,
  );

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
            src={avatarSrc}
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
                <Text className="s-event-post__user-handle">{postHandle}</Text>
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
            ) : !isOwn ? (
              <View
                className="s-event-post__head-actions"
                onClick={stopClickPropagation}
              >
                <ContentReportMenuButton
                  targetType="post"
                  targetId={post.id}
                  targetUserId={post.userId}
                />
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
          postAuthorName={postName}
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

export const EventPostCard = memo(EventPostCardInner, (prev, next) => {
  return (
    prev.post.id === next.post.id &&
    prev.post.body === next.post.body &&
    prev.post.comments === next.post.comments &&
    prev.highlighted === next.highlighted &&
    prev.commentsExpanded === next.commentsExpanded &&
    prev.publishTimeLabel === next.publishTimeLabel &&
    prev.currentUserAvatar === next.currentUserAvatar
  );
});
