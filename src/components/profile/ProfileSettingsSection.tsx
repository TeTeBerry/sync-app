import React from 'react';
import { Ban, Bell, ChevronRight, Info, LogOut, Shield } from '../../components/icons';
import { Text, View } from '@tarojs/components';

export type ProfileSettingsSectionProps = {
  notificationsEnabled: boolean;
  blockedCount?: number;
  onOpenNotifications: () => void;
  onOpenPrivacy: () => void;
  onOpenBlockedUsers: () => void;
  onOpenHelp: () => void;
  onLogout: () => void;
};

const ProfileSettingsSection: React.FC<ProfileSettingsSectionProps> = ({
  notificationsEnabled,
  blockedCount = 0,
  onOpenNotifications,
  onOpenPrivacy,
  onOpenBlockedUsers,
  onOpenHelp,
  onLogout,
}) => (
  <View className="s-profile__settings-card">
    <View
      className="s-profile__settings-row"
      hoverClass="s-profile__settings-row--pressed"
      onClick={onOpenNotifications}
    >
      <View className="s-profile__settings-icon s-profile__settings-icon--bell">
        <Bell size={18} />
      </View>
      <Text className="s-profile__settings-label">通知设置</Text>
      <Text className="s-profile__settings-value">
        {notificationsEnabled ? '已开启' : '已关闭'}
      </Text>
      <ChevronRight size={18} className="s-profile__settings-chevron" />
    </View>

    <View
      className="s-profile__settings-row"
      hoverClass="s-profile__settings-row--pressed"
      onClick={onOpenPrivacy}
    >
      <View className="s-profile__settings-icon s-profile__settings-icon--shield">
        <Shield size={18} />
      </View>
      <Text className="s-profile__settings-label">隐私与安全</Text>
      <ChevronRight size={18} className="s-profile__settings-chevron" />
    </View>

    <View
      className="s-profile__settings-row"
      hoverClass="s-profile__settings-row--pressed"
      onClick={onOpenBlockedUsers}
    >
      <View className="s-profile__settings-icon s-profile__settings-icon--ban">
        <Ban size={18} />
      </View>
      <Text className="s-profile__settings-label">已屏蔽用户</Text>
      {blockedCount > 0 ? (
        <Text className="s-profile__settings-value">{blockedCount} 人</Text>
      ) : null}
      <ChevronRight size={18} className="s-profile__settings-chevron" />
    </View>

    <View
      className="s-profile__settings-row"
      hoverClass="s-profile__settings-row--pressed"
      onClick={onOpenHelp}
    >
      <View className="s-profile__settings-icon s-profile__settings-icon--help">
        <Info size={18} />
      </View>
      <Text className="s-profile__settings-label">帮助与反馈</Text>
      <ChevronRight size={18} className="s-profile__settings-chevron" />
    </View>

    <View
      className="s-profile__settings-row s-profile__settings-row--logout"
      hoverClass="s-profile__settings-row--pressed"
      onClick={onLogout}
    >
      <View className="s-profile__settings-icon s-profile__settings-icon--logout">
        <LogOut size={18} />
      </View>
      <Text className="s-profile__settings-label s-profile__settings-label--logout">
        退出登录
      </Text>
    </View>
  </View>
);

export default ProfileSettingsSection;
