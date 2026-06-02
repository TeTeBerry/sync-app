import React from 'react';
import { Heart, MessageCircle, ThumbsUp } from '../../components/icons';
import { Button } from '../ui';
import { postActionIconColor } from '../../utils/postActionColors';
import { Text, View } from '@tarojs/components';

export type PostCardActionBarVariant = 'home' | 'event';

export type PostCardActionBarProps = {
  variant: PostCardActionBarVariant;
  liked: boolean;
  likes: number;
  comments: number;
  commentsExpanded: boolean;
  onLike: () => void;
  onToggleComments: () => void;
  /** Event detail: disable like when API mock/off. */
  likeDisabled?: boolean;
};

const PostCardActionBar: React.FC<PostCardActionBarProps> = ({
  variant,
  liked,
  likes,
  comments,
  commentsExpanded,
  onLike,
  onToggleComments,
  likeDisabled = false,
}) => {
  const isHome = variant === 'home';
  const actionClass = isHome ? 's-home-post__action' : 's-event-post__action';
  const labelClass = isHome
    ? 's-home-post__action-label'
    : 's-event-post__action-label';
  const iconClass = isHome ? 's-home-post__action-icon' : undefined;

  const likeClassName = [
    actionClass,
    liked && (isHome ? ' s-home-post__action--liked' : ' s-event-post__action--liked'),
  ]
    .filter(Boolean)
    .join('');

  const commentClassName = [
    actionClass,
    commentsExpanded &&
      (isHome ? ' s-home-post__action--active' : ' s-event-post__action--active'),
  ]
    .filter(Boolean)
    .join('');

  const LikeIcon = isHome ? ThumbsUp : Heart;

  return (
    <View className={isHome ? 's-home-post__actions' : 's-event-post__actions'}>
      <Button className={likeClassName} onClick={onLike} disabled={likeDisabled}>
        <LikeIcon
          size={16}
          className={iconClass}
          filled={liked}
          color={postActionIconColor({ liked })}
        />
        <Text className={labelClass}>{likes}</Text>
      </Button>
      <Button className={commentClassName} onClick={onToggleComments}>
        <MessageCircle
          size={16}
          className={iconClass}
          color={postActionIconColor({ active: commentsExpanded })}
        />
        <Text className={labelClass}>{comments}</Text>
      </Button>
    </View>
  );
};

export default PostCardActionBar;
