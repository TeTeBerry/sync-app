import './ProfileGuestSection.scss';
import React, { useCallback, useMemo } from 'react';
import { Bell, ChevronRight, FileText, Info, Lock, Zap } from '../../components/icons';
import { LoginPromptHero } from '../auth/LoginPromptHero';
import { requireAuth } from '../../utils/authGate';
import { go, ROUTES } from '../../utils/route';
import { Text, View } from '@tarojs/components';
import { useT } from '@/hooks/useI18n';

export type ProfileGuestSectionProps = {
  onLoggedIn: () => void;
  onOpenHelp: () => void;
  onOpenLegal: () => void;
};

type LockedFeature = {
  icon: React.ReactNode;
  title: string;
  desc: string;
  feature: 'activity' | 'social' | 'notification';
};

const ProfileGuestSection: React.FC<ProfileGuestSectionProps> = ({
  onLoggedIn,
  onOpenHelp,
  onOpenLegal,
}) => {
  const t = useT();

  const lockedFeatures = useMemo(
    (): LockedFeature[] => [
      {
        icon: <Zap size={18} color="#ff0066" />,
        title: t('profile.guest.activitiesTitle'),
        desc: t('profile.guest.activitiesDesc'),
        feature: 'activity',
      },
      {
        icon: <FileText size={18} color="#bf5af2" />,
        title: t('profile.guest.postsTitle'),
        desc: t('profile.guest.postsDesc'),
        feature: 'social',
      },
      {
        icon: <Bell size={18} color="#8e8e93" />,
        title: t('profile.guest.notificationsTitle'),
        desc: t('profile.guest.notificationsDesc'),
        feature: 'notification',
      },
    ],
    [t],
  );

  const openLockedRoute = useCallback((feature: LockedFeature['feature']) => {
    const routes = {
      activity: ROUTES.PROFILE_ACTIVITIES,
      social: ROUTES.PROFILE_POSTS,
      notification: ROUTES.NOTIFICATIONS,
    } as const;
    requireAuth(() => go(routes[feature]), feature);
  }, []);

  return (
    <View className="s-profile-guest" aria-label={t('profile.guest.aria')}>
      <View className="s-profile-guest__hero">
        <LoginPromptHero onLoggedIn={onLoggedIn} />
      </View>

      <View className="s-profile-guest__locked-card">
        <Text className="s-profile-guest__locked-head">
          {t('profile.guest.loginAfter')}
        </Text>
        {lockedFeatures.map((item) => (
          <View
            key={item.feature}
            className="s-profile-guest__locked-row"
            hoverClass="s-profile-guest__locked-row--pressed"
            onClick={() => openLockedRoute(item.feature)}
          >
            <View className="s-profile-guest__locked-icon">{item.icon}</View>
            <View className="s-profile-guest__locked-copy">
              <Text className="s-profile-guest__locked-title">{item.title}</Text>
              <Text className="s-profile-guest__locked-desc">{item.desc}</Text>
            </View>
            <Lock size={16} color="#636366" aria-hidden />
          </View>
        ))}
      </View>

      <View className="s-profile-guest__settings-card">
        <View
          className="s-profile-guest__settings-row"
          hoverClass="s-profile-guest__settings-row--pressed"
          onClick={onOpenLegal}
        >
          <View className="s-profile-guest__settings-icon">
            <FileText size={18} color="#b0b0b0" />
          </View>
          <Text className="s-profile-guest__settings-label">
            {t('profile.guest.legal')}
          </Text>
          <ChevronRight size={18} color="#636366" />
        </View>
        <View
          className="s-profile-guest__settings-row"
          hoverClass="s-profile-guest__settings-row--pressed"
          onClick={onOpenHelp}
        >
          <View className="s-profile-guest__settings-icon">
            <Info size={18} color="#b0b0b0" />
          </View>
          <Text className="s-profile-guest__settings-label">
            {t('profile.settings.help')}
          </Text>
          <ChevronRight size={18} color="#636366" />
        </View>
      </View>
    </View>
  );
};

export default ProfileGuestSection;
