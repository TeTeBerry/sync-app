import "./AvatarGroup.scss";
import React from "react";
import { ACTIVITY_GUEST_AVATARS } from "../constants/activityGuestAvatars";
import { Image, Text, View } from '@tarojs/components';

interface AvatarGroupProps {
  avatars?: string[];
  max?: number;
  total?: number;
}

const AvatarGroup: React.FC<AvatarGroupProps> = ({
  avatars = ACTIVITY_GUEST_AVATARS,
  max = 3,
  total = 70,
}) => {
  const displayAvatars = avatars.slice(0, max);

  return (
    <View data-cmp="AvatarGroup" className="s-avatar-group">
      <View className="s-avatar-group__pile">
        {displayAvatars.map((url, i) => (
          <Image key={url + i} src={url} className="s-avatar-group__avatar" />
        ))}
      </View>
      {total > 0 ? (
        <Text className="s-avatar-group__count">
          {total.toLocaleString()} 参与
        </Text>
      ) : null}
    </View>
  );
};

export default AvatarGroup;
