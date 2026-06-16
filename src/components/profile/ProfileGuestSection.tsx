import './ProfileGuestSection.scss';
import React, { useCallback } from 'react';
import { Bell, ChevronRight, Info, Lock, Zap } from '../../components/icons';
import { LoginPromptHero } from '../auth/LoginPromptHero';
import { requireAuth } from '../../utils/authGate';
import { go, ROUTES } from '../../utils/route';
import { Text, View } from '@tarojs/components';

export type ProfileGuestSectionProps = {
  onLoggedIn: () => void;
  onOpenHelp: () => void;
  onOpenLegal: () => void;
};

type LockedFeature = {
  icon: React.ReactNode;
  title: string;
  desc: string;
  feature: 'activity' | 'notification';
};

const LOCKED_FEATURES: LockedFeature[] = [
  {
    icon: <Zap size={18} color="#ff0066" />,
    title: '我的活动',
    desc: '报名记录与行程管理',
    feature: 'activity',
  },
  {
    icon: <Bell size={18} color="#8e8e93" />,
    title: '消息通知',
    desc: '活动提醒与系统消息',
    feature: 'notification',
  },
];

const ProfileGuestSection: React.FC<ProfileGuestSectionProps> = ({
  onLoggedIn,
  onOpenHelp,
  onOpenLegal,
}) => {
  const openLockedRoute = useCallback((feature: LockedFeature['feature']) => {
    const routes = {
      activity: ROUTES.PROFILE_ACTIVITIES,
      notification: ROUTES.NOTIFICATIONS,
    } as const;
    requireAuth(() => go(routes[feature]), feature);
  }, []);

  return (
    <View className="s-profile-guest" aria-label="未登录">
      <View className="s-profile-guest__hero">
        <LoginPromptHero onLoggedIn={onLoggedIn} />
      </View>

      <View className="s-profile-guest__locked-card">
        <Text className="s-profile-guest__locked-head">登录后可用</Text>
        {LOCKED_FEATURES.map((item) => (
          <View
            key={item.feature}
            className="s-profile-guest__locked-row"
            hoverClass="s-profile-guest__locked-row--pressed"
            onClick={() => openLockedRoute(item.feature)}
          >
            <View className="s-profile-guest__locked-icon">
              <Lock size={16} color="#8e8e93" />
              {item.icon}
            </View>
            <View className="s-profile-guest__locked-copy">
              <Text className="s-profile-guest__locked-title">{item.title}</Text>
              <Text className="s-profile-guest__locked-desc">{item.desc}</Text>
            </View>
            <ChevronRight size={18} color="#8e8e93" />
          </View>
        ))}
      </View>

      <View className="s-profile-guest__settings-card">
        <View
          className="s-profile-guest__settings-row"
          hoverClass="s-profile-guest__settings-row--pressed"
          onClick={onOpenHelp}
        >
          <View className="s-profile-guest__settings-icon">
            <Info size={18} />
          </View>
          <Text className="s-profile-guest__settings-label">帮助与反馈</Text>
          <ChevronRight size={18} color="#8e8e93" />
        </View>
        <View
          className="s-profile-guest__settings-row"
          hoverClass="s-profile-guest__settings-row--pressed"
          onClick={onOpenLegal}
        >
          <View className="s-profile-guest__settings-icon">
            <Info size={18} />
          </View>
          <Text className="s-profile-guest__settings-label">用户协议与隐私</Text>
          <ChevronRight size={18} color="#8e8e93" />
        </View>
      </View>
    </View>
  );
};

export default ProfileGuestSection;
