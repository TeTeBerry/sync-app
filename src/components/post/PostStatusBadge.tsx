import React from 'react';
import { Text, View } from '@tarojs/components';
import './PostStatusBadge.scss';
import {
  type PostStatusBadgeInput,
  postStatusBadgeTintStyle,
  resolvePostStatusBadge,
  shouldShowPostStatusBadge,
} from '../../utils/postStatusBadge';

export type PostStatusBadgeProps = {
  post: PostStatusBadgeInput;
  variant: 'home' | 'event';
  /** Author's own post: show recruiting / hidden / review status in the badge. */
  isOwn?: boolean;
};

export const PostStatusBadge: React.FC<PostStatusBadgeProps> = ({
  post,
  variant: _variant,
  isOwn = false,
}) => {
  const badge = resolvePostStatusBadge(post);

  if (!shouldShowPostStatusBadge(badge, isOwn, { variant: _variant })) {
    return null;
  }

  const tint = postStatusBadgeTintStyle(badge.color);

  return (
    <View
      className={`s-post-status-badge s-post-status-badge--${badge.variant}`}
      style={tint}
    >
      <View
        className="s-post-status-badge__dot"
        style={{ backgroundColor: badge.color }}
      />
      <Text className="s-post-status-badge__text">{badge.label}</Text>
    </View>
  );
};
