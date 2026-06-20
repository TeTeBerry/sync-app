import React, { useMemo } from 'react';
import { Check, Music2 } from '../../components/icons';
import { PLACEHOLDER_AVATAR } from '../../constants/remoteImages';
import { useResolvedAvatarSrc } from '../../hooks/useResolvedAvatarSrc';
import { resolveAvatarDisplaySrc } from '../../utils/imageUrl';
import type { ProfileDisplayUser } from './profileSummaryUtils';
import { Image, Text, View } from '@tarojs/components';
import { useT } from '@/hooks/useI18n';

export type ProfileSummarySectionProps = {
  user: ProfileDisplayUser;
  interestTag: string | null;
};

const ProfileSummarySection: React.FC<ProfileSummarySectionProps> = ({
  user,
  interestTag,
}) => {
  const t = useT();
  const metaParts = useMemo(
    () => [user.handle, user.location, user.bio].filter(Boolean),
    [user.bio, user.handle, user.location],
  );
  const verified = user.verified;

  const resolvedAvatar = useResolvedAvatarSrc(user.avatar);
  const avatarSrc = resolveAvatarDisplaySrc(
    resolvedAvatar,
    user.avatar,
    PLACEHOLDER_AVATAR,
  );

  return (
    <View className="s-profile__card">
      <View className="s-profile__card-top">
        <View className="s-profile__avatar-wrap">
          <Image className="s-profile__avatar" src={avatarSrc} alt={user.name} />
          <View className="s-profile__online-dot" aria-label={t('profile.online')} />
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
                  <Text>{t('profile.verified')}</Text>
                </View>
              ) : null}
            </View>
          ) : null}
        </View>
      </View>

      <View className="s-profile__stats" aria-label={t('profile.stats')}>
        <View className="s-profile__stat">
          <Text className="s-profile__stat-value">{user.stats.events}</Text>
          <Text className="s-profile__stat-label">{t('profile.eventsLabel')}</Text>
        </View>
        <View className="s-profile__stat">
          <Text className="s-profile__stat-value">{user.stats.posts}</Text>
          <Text className="s-profile__stat-label">{t('profile.postsLabel')}</Text>
        </View>
      </View>
    </View>
  );
};

export default ProfileSummarySection;
