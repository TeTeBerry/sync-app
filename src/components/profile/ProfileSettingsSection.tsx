import React from 'react';
import {
  Ban,
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
  blockedCount?: number;
  matchPreferencesSummary?: string;
  showAccountStatusRow?: boolean;
  accountStatusSummary?: string;
  onOpenNotifications: () => void;
  onOpenMatchPreferences: () => void;
  onOpenPrivacy: () => void;
  onOpenBlockedUsers: () => void;
  onOpenAccountAppeal?: () => void;
  onOpenHelp: () => void;
  onOpenLegal: () => void;
  onLogout: () => void;
};

const ProfileSettingsSection: React.FC<ProfileSettingsSectionProps> = ({
  notificationsEnabled,
  blockedCount = 0,
  matchPreferencesSummary = '未设置',
  showAccountStatusRow = false,
  accountStatusSummary = '发帖已限制',
  onOpenNotifications,
  onOpenMatchPreferences,
  onOpenPrivacy,
  onOpenBlockedUsers,
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
        <ChevronRight size={18} className="s-profile__settings-chevron" />
      </View>
    ) : null}

    <View
      className="s-profile__settings-row"
      hoverClass="s-profile__settings-row--pressed"
      onClick={onOpenMatchPreferences}
    >
      <View className="s-profile__settings-icon s-profile__settings-icon--match">
        <Music2 size={18} />
      </View>
      <Text className="s-profile__settings-label">组队偏好</Text>
      <Text className="s-profile__settings-value s-profile__settings-value--truncate">
        {matchPreferencesSummary}
      </Text>
      <ChevronRight size={18} className="s-profile__settings-chevron" />
    </View>

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
      onClick={onOpenLegal}
    >
      <View className="s-profile__settings-icon s-profile__settings-icon--help">
        <FileText size={18} />
      </View>
      <Text className="s-profile__settings-label">法律与协议</Text>
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
