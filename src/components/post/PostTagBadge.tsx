import './ContentTypeBadge.scss';
import React from 'react';
import { Text, View } from '@tarojs/components';
import { formatPostTagLabel, postTagBadgeClass } from '../../utils/postTagDisplay';

export type PostTagBadgeProps = {
  tag: string;
};

export const PostTagBadge: React.FC<PostTagBadgeProps> = ({ tag }) => {
  const label = formatPostTagLabel(tag);
  if (!label) return null;

  return (
    <View className={postTagBadgeClass(tag)}>
      <Text className="s-content-badge__label">{label}</Text>
    </View>
  );
};
