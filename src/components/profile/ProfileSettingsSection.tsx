import React from 'react';
import {
  Bell,
  ChevronRight,
  FileText,
  Languages,
  Info,
  LogOut,
  Music2,
  Shield,
  ShieldAlert,
} from '../../components/icons';
import { Text, View } from '@tarojs/components';
import { useT } from '@/hooks/useI18n';

export type ProfileSettingsSectionProps = {
  notificationsEnabled: boolean;
  buddyPreferencesSummary?: string;
  showAccountStatusRow?: boolean;
  accountStatusSummary?: string;
  onOpenNotifications: () => void;
  onOpenBuddyPreferences: () => void;
  onOpenPrivacy: () => void;
  onOpenLanguage: () => void;
  onOpenAccountAppeal?: () => void;
  onOpenHelp: () => void;
  onOpenLegal: () => void;
  onLogout: () => void;
};

const ProfileSettingsSection: React.FC<ProfileSettingsSectionProps> = ({
  notificationsEnabled,
  buddyPreferencesSummary,
  showAccountStatusRow = false,
  accountStatusSummary,
  onOpenNotifications,
  onOpenBuddyPreferences,
  onOpenPrivacy,
  onOpenLanguage,
  onOpenAccountAppeal,
  onOpenHelp,
  onOpenLegal,
  onLogout,
}) => {
  const t = useT();
  const prefsSummary = buddyPreferencesSummary ?? t('common.notSet');
  const riskSummary = accountStatusSummary ?? t('profile.settings.postRestricted');

  return (
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
          <Text className="s-profile__settings-label">
            {t('profile.settings.accountStatus')}
          </Text>
          <Text className="s-profile__settings-value s-profile__settings-value--risk">
            {riskSummary}
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
        <Text className="s-profile__settings-label">
          {t('profile.settings.buddyPrefs')}
        </Text>
        <Text className="s-profile__settings-value s-profile__settings-value--truncate">
          {prefsSummary}
        </Text>
        <ChevronRight
          size={18}
          color="#b0b0b0"
          className="s-profile__settings-chevron"
        />
      </View>

      <View
        className="s-profile__settings-row"
        hoverClass="s-profile__settings-row--pressed"
        onClick={onOpenNotifications}
      >
        <View className="s-profile__settings-icon s-profile__settings-icon--bell">
          <Bell size={18} color="#4cc9f0" />
        </View>
        <Text className="s-profile__settings-label">
          {t('profile.settings.notifications')}
        </Text>
        <Text className="s-profile__settings-value">
          {notificationsEnabled
            ? t('profile.settings.notificationsOn')
            : t('profile.settings.notificationsOff')}
        </Text>
        <ChevronRight
          size={18}
          color="#b0b0b0"
          className="s-profile__settings-chevron"
        />
      </View>

      <View
        className="s-profile__settings-row"
        hoverClass="s-profile__settings-row--pressed"
        onClick={onOpenPrivacy}
      >
        <View className="s-profile__settings-icon s-profile__settings-icon--shield">
          <Shield size={18} color="#22c55e" />
        </View>
        <Text className="s-profile__settings-label">
          {t('profile.settings.privacy')}
        </Text>
        <ChevronRight size={18} className="s-profile__settings-chevron" />
      </View>

      <View
        className="s-profile__settings-row"
        hoverClass="s-profile__settings-row--pressed"
        onClick={onOpenLanguage}
      >
        <View className="s-profile__settings-icon s-profile__settings-icon--language">
          <Languages size={18} color="#bf5af2" />
        </View>
        <Text className="s-profile__settings-label">
          {t('profile.settings.language')}
        </Text>
        <ChevronRight
          size={18}
          color="#b0b0b0"
          className="s-profile__settings-chevron"
        />
      </View>

      <View
        className="s-profile__settings-row"
        hoverClass="s-profile__settings-row--pressed"
        onClick={onOpenLegal}
      >
        <View className="s-profile__settings-icon s-profile__settings-icon--help">
          <FileText size={18} color="#b0b0b0" />
        </View>
        <Text className="s-profile__settings-label">{t('profile.settings.legal')}</Text>
        <ChevronRight
          size={18}
          color="#b0b0b0"
          className="s-profile__settings-chevron"
        />
      </View>

      <View
        className="s-profile__settings-row"
        hoverClass="s-profile__settings-row--pressed"
        onClick={onOpenHelp}
      >
        <View className="s-profile__settings-icon s-profile__settings-icon--help">
          <Info size={18} color="#b0b0b0" />
        </View>
        <Text className="s-profile__settings-label">{t('profile.settings.help')}</Text>
        <ChevronRight
          size={18}
          color="#b0b0b0"
          className="s-profile__settings-chevron"
        />
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
          {t('profile.settings.logout')}
        </Text>
      </View>
    </View>
  );
};

export default ProfileSettingsSection;
