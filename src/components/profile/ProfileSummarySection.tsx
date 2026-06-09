import React, { useMemo } from 'react';
import { Check, Music2 } from '../../components/icons';
import { sanitizeRemoteImageUrl } from '../../utils/imageUrl';
import type { ProfileDisplayUser } from './profileSummaryUtils';
import { Image, Text, View } from '@tarojs/components';

export type ProfileSummarySectionProps = {
  user: ProfileDisplayUser;
  interestTag: string | null;
};

const ProfileSummarySection: React.FC<ProfileSummarySectionProps> = ({
  user,
  interestTag,
}) => {
  const metaParts = useMemo(
    () => [user.handle, user.location, user.bio].filter(Boolean),
    [user.bio, user.handle, user.location],
  );
  const verified = user.verified;

  return (
    <View className="s-profile__card">
      <View className="s-profile__card-top">
        <View className="s-profile__avatar-wrap">
          <Image
            className="s-profile__avatar"
            src={sanitizeRemoteImageUrl(user.avatar) ?? user.avatar}
            alt={user.name}
          />
          <View className="s-profile__online-dot" aria-label="在线" />
        </View>

        <View className="s-profile__info">
          <Text className="s-profile__name">{user.name}</Text>
          {metaParts.length > 0 ? (
            <Text className="s-profile__meta-line">{metaParts.join(' · ')}</Text>
          ) : null}
          {interestTag || verified ? (
            <View className="s-profile__tags">
              {interestTag ? (
                <View className="s-profile__tag s-profile__tag--primary">
                  <Music2 size={12} />
                  <Text>{interestTag}</Text>
                </View>
              ) : null}
              {verified ? (
                <View className="s-profile__tag s-profile__tag--verified">
                  <Check size={12} strokeWidth={3} />
                  <Text>已认证</Text>
                </View>
              ) : null}
            </View>
          ) : null}
        </View>
      </View>

      <View className="s-profile__stats" aria-label="个人数据">
        <View className="s-profile__stat">
          <Text className="s-profile__stat-value">{user.stats.events}</Text>
          <Text className="s-profile__stat-label">参加活动</Text>
        </View>
        <View className="s-profile__stat s-profile__stat--accent">
          <Text className="s-profile__stat-value">{user.stats.matchSuccess}</Text>
          <Text className="s-profile__stat-label">组队成功</Text>
        </View>
        <View className="s-profile__stat">
          <Text className="s-profile__stat-value">{user.stats.likes}</Text>
          <Text className="s-profile__stat-label">获赞数</Text>
        </View>
        <View className="s-profile__stat">
          <Text className="s-profile__stat-value">{user.stats.posts}</Text>
          <Text className="s-profile__stat-label">组队帖</Text>
        </View>
      </View>
    </View>
  );
};

export default ProfileSummarySection;
