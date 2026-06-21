import './settings.scss';
import Taro, { useRouter } from '@tarojs/taro';
import React, { useCallback, useEffect, useMemo, useState } from 'react';
import { Check, ChevronRight } from '../../../components/icons';
import PageNavigation from '../../../components/navigation/PageNavigation';
import { ROUTES } from '../../../utils/route';
import {
  updateCurrentUserAndInvalidate,
  useCurrentUserQuery,
} from '../../../hooks/useSyncApi';
import { saveEncryptedProfileSnapshot } from '../../../utils/profileSnapshotStorage';
import {
  readProfileNotificationsEnabled,
  readProfilePrivacyLevel,
  writeProfileNotificationsEnabled,
  writeProfilePrivacyLevel,
  type ProfilePrivacyLevel,
} from '../../../utils/profileStorage';
import { useProfilePageStore } from '../../../stores/profilePageStore';
import { useEndRouteTransitionOnShow } from '../../../hooks/useEndRouteTransitionOnShow';
import { useStackPageMainHeight } from '../../../hooks/useTabPageMainHeight';
import { isLiveApi } from '../../../constants/api';
import { isLoggedIn } from '../../../utils/authStorage';
import { Button } from '../../../components/ui';
import { ScrollView, Text, View } from '@tarojs/components';
import { AccountRiskBanner } from '../../../components/account-risk/AccountRiskBanner';
import { useAccountRisk } from '../../../hooks/useAccountRisk';
import { BuddyPreferencesSettings } from './components/BuddyPreferencesSettings';
import { AppealSettings } from './components/AppealSettings';
import { HelpFeedbackSettings } from './components/HelpFeedbackSettings';
import { getLegalDocList } from '../../../legal';
import { goLegalDocument } from '../../../utils/legalRoute';
import { useI18n } from '@/hooks/useI18n';
import type { AppLocale } from '@/i18n/types';

type SettingsSection =
  | 'notifications'
  | 'privacy'
  | 'help'
  | 'legal'
  | 'buddy-prefs'
  | 'appeal'
  | 'language';

type PrivacyLevel = ProfilePrivacyLevel;

const SettingsPage: React.FC = () => {
  useEndRouteTransitionOnShow();
  const mainScrollHeight = useStackPageMainHeight();
  const router = useRouter();
  const section = (router.params.section ?? 'notifications') as SettingsSection;
  const { data: currentUser } = useCurrentUserQuery();
  const { accountRisk, refreshAccountRisk } = useAccountRisk();
  const { locale, setLocale, t } = useI18n();

  const sectionTitles: Record<SettingsSection, string> = useMemo(
    () => ({
      notifications: t('settings.notifications'),
      privacy: t('settings.privacy'),
      help: t('settings.help'),
      legal: t('settings.legal'),
      'buddy-prefs': t('settings.buddyPrefs'),
      appeal: t('settings.appeal'),
      language: t('settings.language'),
    }),
    [t],
  );

  const privacyLabels: Record<PrivacyLevel, string> = useMemo(
    () => ({
      public: t('settings.privacyPublic'),
      private: t('settings.privacyPrivate'),
    }),
    [t],
  );

  const privacyDescs: Record<PrivacyLevel, string> = useMemo(
    () => ({
      public: t('settings.privacyPublicDesc'),
      private: t('settings.privacyPrivateDesc'),
    }),
    [t],
  );

  const legalDocList = useMemo(() => getLegalDocList(locale), [locale]);

  useEffect(() => {
    if (isLiveApi() && isLoggedIn()) {
      void refreshAccountRisk();
    }
  }, [refreshAccountRisk]);
  const setStoreNotificationsEnabled = useProfilePageStore(
    (state) => state.setNotificationsEnabled,
  );

  const [notificationsEnabled, setNotificationsEnabled] = useState(() =>
    readProfileNotificationsEnabled(),
  );
  const [privacyLevel, setPrivacyLevel] = useState<PrivacyLevel>(() =>
    readProfilePrivacyLevel(),
  );

  const setStorePrivacyLevel = useProfilePageStore((state) => state.setPrivacyLevel);

  useEffect(() => {
    if (!isLiveApi()) return;
    if ((section === 'buddy-prefs' || section === 'appeal') && !isLoggedIn()) {
      void Taro.showToast({ title: t('common.loginRequired'), icon: 'none' });
      void Taro.navigateBack();
    }
  }, [section, t]);

  useEffect(() => {
    if (currentUser?.notificationsEnabled == null) return;
    setNotificationsEnabled(currentUser.notificationsEnabled);
    setStoreNotificationsEnabled(currentUser.notificationsEnabled);
    writeProfileNotificationsEnabled(currentUser.notificationsEnabled);
  }, [currentUser?.notificationsEnabled, setStoreNotificationsEnabled]);

  useEffect(() => {
    if (!currentUser?.privacyLevel) return;
    const level = readProfilePrivacyLevel(currentUser.privacyLevel);
    setPrivacyLevel(level);
    setStorePrivacyLevel(level);
    writeProfilePrivacyLevel(level);
  }, [currentUser?.privacyLevel, setStorePrivacyLevel]);

  const toggleNotifications = useCallback(() => {
    setNotificationsEnabled((prev) => {
      const next = !prev;
      writeProfileNotificationsEnabled(next);
      setStoreNotificationsEnabled(next);

      void updateCurrentUserAndInvalidate({
        notificationsEnabled: next,
      }).catch(() => undefined);

      void saveEncryptedProfileSnapshot({
        notificationsEnabled: next,
        city: currentUser?.city,
        favorGenres: currentUser?.favorGenres,
        budgetLevel: currentUser?.budgetLevel,
      });

      return next;
    });
  }, [
    currentUser?.budgetLevel,
    currentUser?.city,
    currentUser?.favorGenres,
    setStoreNotificationsEnabled,
  ]);

  const selectPrivacy = useCallback(
    (level: PrivacyLevel) => {
      setPrivacyLevel(level);
      setStorePrivacyLevel(level);
      writeProfilePrivacyLevel(level);
      void updateCurrentUserAndInvalidate({ privacyLevel: level })
        .then(() => {
          void Taro.showToast({ title: t('common.save'), icon: 'success' });
        })
        .catch(() => {
          void Taro.showToast({ title: t('common.requestFailed'), icon: 'none' });
        });
    },
    [setStorePrivacyLevel, t],
  );

  const selectLocale = useCallback(
    (next: AppLocale) => {
      setLocale(next);
      void Taro.showToast({ title: t('common.save'), icon: 'success' });
    },
    [setLocale, t],
  );

  const privacyOptions: PrivacyLevel[] = ['public', 'private'];
  const languageOptions: { value: AppLocale; label: string }[] = [
    { value: 'zh-CN', label: t('settings.languageZh') },
    { value: 'en-US', label: t('settings.languageEn') },
  ];

  const scrollStyle =
    mainScrollHeight != null ? { height: `${mainScrollHeight}px` } : undefined;

  return (
    <View data-cmp="Settings" className="s-settings">
      <PageNavigation
        title={sectionTitles[section]}
        fallback={ROUTES.PROFILE}
        tone="surface"
      />

      <AccountRiskBanner accountRisk={accountRisk} />

      {section === 'buddy-prefs' ? (
        <ScrollView
          scrollY
          enhanced
          showScrollbar={false}
          className="s-settings__scroll s-scrollbar-none"
          style={scrollStyle}
        >
          <View className="s-settings__main">
            <BuddyPreferencesSettings />
          </View>
        </ScrollView>
      ) : section === 'appeal' ? (
        <ScrollView
          scrollY
          enhanced
          showScrollbar={false}
          className="s-settings__scroll s-scrollbar-none"
          style={scrollStyle}
        >
          <View className="s-settings__main">
            <AppealSettings />
          </View>
        </ScrollView>
      ) : (
        <ScrollView
          scrollY
          enhanced
          showScrollbar={false}
          className="s-settings__scroll s-scrollbar-none"
          style={scrollStyle}
        >
          <View className="s-settings__main">
            {section === 'notifications' && (
              <View className="s-settings__card">
                <View className="s-settings__row">
                  <View>
                    <View className="s-settings__row-label">
                      {t('settings.pushNotifications')}
                    </View>
                    <View className="s-settings__row-desc">
                      {t('settings.pushNotificationsDesc')}
                    </View>
                  </View>
                  <Button
                    role="switch"
                    aria-checked={notificationsEnabled}
                    className={`s-settings__toggle${notificationsEnabled ? ' s-settings__toggle--on' : ''}`}
                    onClick={toggleNotifications}
                  >
                    <Text className="s-settings__toggle-knob" />
                  </Button>
                </View>
                <View className="s-settings__row">
                  <View>
                    <View className="s-settings__row-label">
                      {t('settings.activityReminder')}
                    </View>
                    <View className="s-settings__row-desc">
                      {t('settings.activityReminderDesc')}
                    </View>
                  </View>
                  <Button
                    role="switch"
                    aria-checked={notificationsEnabled}
                    className={`s-settings__toggle${notificationsEnabled ? ' s-settings__toggle--on' : ''}`}
                    onClick={toggleNotifications}
                  >
                    <Text className="s-settings__toggle-knob" />
                  </Button>
                </View>
              </View>
            )}

            {section === 'privacy' && (
              <View className="s-settings__card">
                {privacyOptions.map((level) => (
                  <Button
                    key={level}
                    className={`s-settings__option${privacyLevel === level ? ' s-settings__option--selected' : ''}`}
                    onClick={() => selectPrivacy(level)}
                  >
                    <View>
                      <View className="s-settings__option-label">
                        {privacyLabels[level]}
                      </View>
                      <View className="s-settings__option-desc">
                        {privacyDescs[level]}
                      </View>
                    </View>
                    {privacyLevel === level && (
                      <Check size={20} className="s-settings__check" />
                    )}
                  </Button>
                ))}
              </View>
            )}

            {section === 'language' && (
              <View className="s-settings__card">
                <View className="s-settings__row s-settings__row--static">
                  <View>
                    <View className="s-settings__row-label">
                      {t('settings.language')}
                    </View>
                    <View className="s-settings__row-desc">
                      {t('settings.languageDesc')}
                    </View>
                  </View>
                </View>
                {languageOptions.map((option) => (
                  <Button
                    key={option.value}
                    className={`s-settings__option${locale === option.value ? ' s-settings__option--selected' : ''}`}
                    onClick={() => selectLocale(option.value)}
                  >
                    <View>
                      <View className="s-settings__option-label">{option.label}</View>
                    </View>
                    {locale === option.value && (
                      <Check size={20} className="s-settings__check" />
                    )}
                  </Button>
                ))}
              </View>
            )}

            {section === 'legal' && (
              <View className="s-settings__card">
                {legalDocList.map((doc) => (
                  <View
                    key={doc.id}
                    className="s-settings__option s-settings__option--row"
                    hoverClass="s-settings__option--pressed"
                    onClick={() => goLegalDocument(doc.id)}
                  >
                    <View className="s-settings__option-copy">
                      <Text className="s-settings__option-label">{doc.title}</Text>
                      <Text className="s-settings__option-desc">
                        {t('common.updatedAt', { date: doc.updatedAt })}
                      </Text>
                    </View>
                    <ChevronRight size={18} color="#636366" />
                  </View>
                ))}
              </View>
            )}

            {section === 'help' && <HelpFeedbackSettings />}
          </View>
        </ScrollView>
      )}
    </View>
  );
};

export default SettingsPage;
