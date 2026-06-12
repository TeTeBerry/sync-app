import './AvatarGroup.scss';
import React from 'react';
import { thumbnailImageUrl } from '../utils/imageUrl';
import { Image, Text, View } from '@tarojs/components';

interface AvatarGroupProps {
  avatars?: string[];
  max?: number;
  total?: number;
}

const AvatarGroup: React.FC<AvatarGroupProps> = ({
  avatars = [],
  max = 3,
  total = 0,
}) => {
  const displayAvatars = avatars.slice(0, max);

  return (
    <View data-cmp="AvatarGroup" className="s-avatar-group">
      {displayAvatars.length > 0 ? (
        <View className="s-avatar-group__pile">
          {displayAvatars.map((url, i) => (
            <Image
              key={url + i}
              src={thumbnailImageUrl(url, 80) ?? url}
              className="s-avatar-group__avatar"
            />
          ))}
        </View>
      ) : null}
      {total > 0 ? (
        <Text className="s-avatar-group__count">{total.toLocaleString()} 参与</Text>
      ) : null}
    </View>
  );
};

export default AvatarGroup;
