import './ProfileGuestSection.scss';
import React, { useCallback } from 'react';
import { Bell, ChevronRight, FileText, Info, Lock, Zap } from '../../components/icons';
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
  feature: 'activity' | 'post' | 'notification';
};

const LOCKED_FEATURES: LockedFeature[] = [
  {
    icon: <Zap size={18} color="#ff0066" />,
    title: '我的活动',
    desc: '报名记录与行程管理',
    feature: 'activity',
  },
  {
    icon: <FileText size={18} color="#bf5af2" />,
    title: '我的组队帖',
    desc: '组队帖与申请管理',
    feature: 'post',
  },
  {
    icon: <Bell size={18} color="#8e8e93" />,
    title: '消息通知',
    desc: '评论、点赞与活动提醒',
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
      post: ROUTES.PROFILE_POSTS,
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
            key={item.title}
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
            <FileText size={18} />
          </View>
          <Text className="s-profile-guest__settings-label">法律与协议</Text>
          <ChevronRight size={18} color="#636366" />
        </View>
        <View
          className="s-profile-guest__settings-row"
          hoverClass="s-profile-guest__settings-row--pressed"
          onClick={onOpenHelp}
        >
          <View className="s-profile-guest__settings-icon">
            <Info size={18} />
          </View>
          <Text className="s-profile-guest__settings-label">帮助与反馈</Text>
          <ChevronRight size={18} color="#636366" />
        </View>
      </View>
    </View>
  );
};

export default ProfileGuestSection;
