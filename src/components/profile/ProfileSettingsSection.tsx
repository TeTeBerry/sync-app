import React from 'react';
import { Bell, ChevronRight, Info, LogOut, Shield } from 'lucide-react-taro';
import { Text, View } from '@tarojs/components';

export type ProfileSettingsSectionProps = {
  notificationsEnabled: boolean;
  onOpenNotifications: () => void;
  onOpenPrivacy: () => void;
  onOpenHelp: () => void;
  onLogout: () => void;
};

const ProfileSettingsSection: React.FC<ProfileSettingsSectionProps> = ({
  notificationsEnabled,
  onOpenNotifications,
  onOpenPrivacy,
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
