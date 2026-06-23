import './ProfilePersonalityNudgeCard.scss';
import React from 'react';
import { AudioWaveform, ChevronRight } from '../../components/icons';
import { Text, View } from '@tarojs/components';
import { useT } from '@/hooks/useI18n';

export type ProfilePersonalityNudgeCardProps = {
  onStart: () => void;
  onDismiss: () => void;
};

const ProfilePersonalityNudgeCard: React.FC<ProfilePersonalityNudgeCardProps> = ({
  onStart,
  onDismiss,
}) => {
  const t = useT();

  return (
    <View
      className="s-profile-personality-nudge"
      aria-label={t('profile.personalityNudge.aria')}
    >
      <View className="s-profile-personality-nudge__top">
        <View className="s-profile-personality-nudge__icon-wrap" aria-hidden>
          <AudioWaveform size={20} color="#ff0066" />
        </View>
        <View className="s-profile-personality-nudge__copy">
          <Text className="s-profile-personality-nudge__title">
            {t('profile.personalityNudge.title')}
          </Text>
          <Text className="s-profile-personality-nudge__subtitle">
            {t('profile.personalityNudge.subtitle')}
          </Text>
        </View>
      </View>

      <View className="s-profile-personality-nudge__actions">
        <View
          className="s-profile-personality-nudge__start"
          hoverClass="s-profile-personality-nudge__start--pressed"
          onClick={onStart}
        >
          <Text className="s-profile-personality-nudge__start-text">
            {t('profile.personalityNudge.start')}
          </Text>
        </View>
        <View
          className="s-profile-personality-nudge__dismiss"
          hoverClass="s-profile-personality-nudge__dismiss--pressed"
          onClick={onDismiss}
        >
          <Text className="s-profile-personality-nudge__dismiss-text">
            {t('profile.personalityNudge.dismiss')}
          </Text>
          <ChevronRight size={14} color="#636366" aria-hidden />
        </View>
      </View>

      <Text className="s-profile-personality-nudge__footnote">
        {t('profile.personalityNudge.footnote')}
      </Text>
    </View>
  );
};

export default ProfilePersonalityNudgeCard;
