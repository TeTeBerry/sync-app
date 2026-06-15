import { memo } from 'react';
import { MapPin } from '../../../components/icons';
import { ImageWithFallback } from '../../../components/ImageWithFallback';
import {
  PostImageGrid,
  PostOwnerDeleteButton,
  stripContentTypeHashtags,
} from '../../../components/post';
import { EVENT_POST_IMAGE_MAX_DISPLAY } from '../../../constants/listPerf';
import { isCurrentUserPostAuthor } from '../../../utils/postOwnership';
import type { EventDetailPost } from '../../../types/backend';
import { formatEventPostHandle } from '../utils/eventPostDisplay';
import { Text, View } from '@tarojs/components';

export type EventPostCardProps = {
  post: EventDetailPost;
  publishTimeLabel: string;
  highlighted: boolean;
  onDelete?: (post: EventDetailPost) => void;
};

function EventPostCardInner({
  post,
  publishTimeLabel,
  highlighted,
  onDelete,
}: EventPostCardProps) {
  const postName = post.name?.trim() || '用户';
  const isOwn = isCurrentUserPostAuthor(postName, post.userId);
  const bodyText = stripContentTypeHashtags(post.body);
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
              <View className="s-event-post__head-actions">
                <PostOwnerDeleteButton onDelete={() => onDelete(post)} />
              </View>
            ) : null}
          </View>
        </View>
      </View>

      {bodyText ? <Text className="s-event-post__text">{bodyText}</Text> : null}

      {post.images?.length ? (
        <PostImageGrid images={post.images} maxDisplay={EVENT_POST_IMAGE_MAX_DISPLAY} />
      ) : null}
    </View>
  );
}

export const EventPostCard = memo(EventPostCardInner);
