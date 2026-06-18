import React from 'react';
import {
  Bell,
  ChevronRight,
  FileText,
  Info,
  LogOut,
  Music2,
  Shield,
  ShieldAlert,
} from '../../components/icons';
import { Text, View } from '@tarojs/components';

export type ProfileSettingsSectionProps = {
  notificationsEnabled: boolean;
  buddyPreferencesSummary?: string;
  showAccountStatusRow?: boolean;
  accountStatusSummary?: string;
  onOpenNotifications: () => void;
  onOpenBuddyPreferences: () => void;
  onOpenPrivacy: () => void;
  onOpenAccountAppeal?: () => void;
  onOpenHelp: () => void;
  onOpenLegal: () => void;
  onLogout: () => void;
};

const ProfileSettingsSection: React.FC<ProfileSettingsSectionProps> = ({
  notificationsEnabled,
  buddyPreferencesSummary = '未设置',
  showAccountStatusRow = false,
  accountStatusSummary = '发帖已限制',
  onOpenNotifications,
  onOpenBuddyPreferences,
  onOpenPrivacy,
  onOpenAccountAppeal,
  onOpenHelp,
  onOpenLegal,
  onLogout,
}) => (
  <View className="s-profile__settings-card">
    {showAccountStatusRow && onOpenAccountAppeal ? (
      <View
        className="s-profile__settings-row s-profile__settings-row--risk"
        hoverClass="s-profile__settings-row--pressed"
        onClick={onOpenAccountAppeal}
      >
        <View className="s-profile__settings-icon s-profile__settings-icon--risk">
          <ShieldAlert size={18} color="#ff6b6b" />
        </View>
        <Text className="s-profile__settings-label">账号状态</Text>
        <Text className="s-profile__settings-value s-profile__settings-value--risk">
          {accountStatusSummary}
        </Text>
        <ChevronRight
          size={18}
          color="#b0b0b0"
          className="s-profile__settings-chevron"
        />
      </View>
    ) : null}

    <View
      className="s-profile__settings-row"
      hoverClass="s-profile__settings-row--pressed"
      onClick={onOpenBuddyPreferences}
    >
      <View className="s-profile__settings-icon s-profile__settings-icon--match">
        <Music2 size={18} color="#ff0066" />
      </View>
      <Text className="s-profile__settings-label">用户偏好</Text>
      <Text className="s-profile__settings-value s-profile__settings-value--truncate">
        {buddyPreferencesSummary}
      </Text>
      <ChevronRight size={18} color="#b0b0b0" className="s-profile__settings-chevron" />
    </View>

    <View
      className="s-profile__settings-row"
      hoverClass="s-profile__settings-row--pressed"
      onClick={onOpenNotifications}
    >
      <View className="s-profile__settings-icon s-profile__settings-icon--bell">
        <Bell size={18} color="#4cc9f0" />
      </View>
      <Text className="s-profile__settings-label">通知设置</Text>
      <Text className="s-profile__settings-value">
        {notificationsEnabled ? '已开启' : '已关闭'}
      </Text>
      <ChevronRight size={18} color="#b0b0b0" className="s-profile__settings-chevron" />
    </View>

    <View
      className="s-profile__settings-row"
      hoverClass="s-profile__settings-row--pressed"
      onClick={onOpenPrivacy}
    >
      <View className="s-profile__settings-icon s-profile__settings-icon--shield">
        <Shield size={18} color="#22c55e" />
      </View>
      <Text className="s-profile__settings-label">隐私与安全</Text>
      <ChevronRight size={18} className="s-profile__settings-chevron" />
    </View>

    <View
      className="s-profile__settings-row"
      hoverClass="s-profile__settings-row--pressed"
      onClick={onOpenLegal}
    >
      <View className="s-profile__settings-icon s-profile__settings-icon--help">
        <FileText size={18} color="#b0b0b0" />
      </View>
      <Text className="s-profile__settings-label">法律与协议</Text>
      <ChevronRight size={18} color="#b0b0b0" className="s-profile__settings-chevron" />
    </View>

    <View
      className="s-profile__settings-row"
      hoverClass="s-profile__settings-row--pressed"
      onClick={onOpenHelp}
    >
      <View className="s-profile__settings-icon s-profile__settings-icon--help">
        <Info size={18} color="#b0b0b0" />
      </View>
      <Text className="s-profile__settings-label">帮助与反馈</Text>
      <ChevronRight size={18} color="#b0b0b0" className="s-profile__settings-chevron" />
    </View>

    <View
      className="s-profile__settings-row s-profile__settings-row--logout"
      hoverClass="s-profile__settings-row--pressed"
      onClick={onLogout}
    >
      <View className="s-profile__settings-icon s-profile__settings-icon--logout">
        <LogOut size={18} color="#ff6467" />
      </View>
      <Text className="s-profile__settings-label s-profile__settings-label--logout">
        退出登录
      </Text>
    </View>
  </View>
);

export default ProfileSettingsSection;
