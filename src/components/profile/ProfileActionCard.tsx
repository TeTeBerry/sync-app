import React from 'react';
import { ChevronRight } from '../../components/icons';
import { Text, View } from '@tarojs/components';

export type ProfileActionCardAccent = 'activities' | 'posts';

export type ProfileActionCardProps = {
  accent: ProfileActionCardAccent;
  icon: React.ReactNode;
  title: string;
  badge: number;
  subtitle: string;
  onClick: () => void;
};

const ProfileActionCard: React.FC<ProfileActionCardProps> = ({
  accent,
  icon,
  title,
  badge,
  subtitle,
  onClick,
}) => (
  <View
    className={`s-profile__action-card s-profile__action-card--${accent}`}
    hoverClass="s-profile__action-card--pressed"
    onClick={onClick}
  >
    <View className={`s-profile__action-icon s-profile__action-icon--${accent}`}>
      {icon}
    </View>
    <View className="s-profile__action-copy">
      <View className="s-profile__action-title-row">
        <Text className="s-profile__action-title">{title}</Text>
        {badge > 0 ? (
          <Text
            className={`s-profile__action-badge s-profile__action-badge--${accent}`}
          >
            {badge}
          </Text>
        ) : null}
      </View>
      <Text className="s-profile__action-subtitle">{subtitle}</Text>
    </View>
    <ChevronRight size={18} className="s-profile__action-chevron" />
  </View>
);

export default ProfileActionCard;
