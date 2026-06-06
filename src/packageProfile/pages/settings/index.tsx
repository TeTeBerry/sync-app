import './settings.scss';
import Taro, { useRouter } from '@tarojs/taro';
import React, { useCallback, useEffect, useState } from 'react';
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
import { isLiveApi } from '../../../constants/api';
import { isLoggedIn } from '../../../utils/authStorage';
import { Button } from '../../../components/ui';
import { ScrollView, Text, View } from '@tarojs/components';
import { AccountRiskBanner } from '../../../components/account-risk/AccountRiskBanner';
import { useAccountRisk } from '../../../hooks/useAccountRisk';
import { BlockedUsersSettings } from './components/BlockedUsersSettings';
import { MatchPreferencesSettings } from './components/MatchPreferencesSettings';
import { AppealSettings } from './components/AppealSettings';
import { HelpFeedbackSettings } from './components/HelpFeedbackSettings';
import { LEGAL_DOC_LIST } from '../../../legal';
import { goLegalDocument } from '../../../utils/legalRoute';
type SettingsSection =
  | 'notifications'
  | 'privacy'
  | 'help'
  | 'legal'
  | 'blocked'
  | 'match'
  | 'appeal';
type PrivacyLevel = ProfilePrivacyLevel;

const SECTION_TITLES: Record<SettingsSection, string> = {
  notifications: '消息通知',
  privacy: '隐私设置',
  help: '帮助与反馈',
  legal: '法律与协议',
  blocked: '已屏蔽用户',
  match: '组队偏好',
  appeal: '申诉说明',
};

const PRIVACY_LABELS: Record<PrivacyLevel, string> = {
  public: '公开',
  friends: '仅好友',
  private: '私密',
};

const PRIVACY_DESCS: Record<PrivacyLevel, string> = {
  public: '所有人可见你的主页和活动记录',
  friends: '仅互相关注的用户可见',
  private: '仅自己可见',
};

const SettingsPage: React.FC = () => {
  useEndRouteTransitionOnShow();
  const router = useRouter();
  const section = (router.params.section ?? 'notifications') as SettingsSection;
  const { data: currentUser } = useCurrentUserQuery();
  const { accountRisk, refreshAccountRisk } = useAccountRisk();

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
    if (!isLiveApi()) return; // skip login guard when API is not configured
    if (
      (section === 'blocked' || section === 'match' || section === 'appeal') &&
      !isLoggedIn()
    ) {
      void Taro.showToast({ title: '请先登录', icon: 'none' });
      void Taro.navigateBack();
    }
  }, [section]);

  useEffect(() => {
    if (currentUser?.notificationsEnabled == null) return;
    setNotificationsEnabled(currentUser.notificationsEnabled);
    setStoreNotificationsEnabled(currentUser.notificationsEnabled);
    writeProfileNotificationsEnabled(currentUser.notificationsEnabled);
  }, [currentUser?.notificationsEnabled, setStoreNotificationsEnabled]);

  useEffect(() => {
    if (!currentUser?.privacyLevel) return;
    setPrivacyLevel(currentUser.privacyLevel);
    setStorePrivacyLevel(currentUser.privacyLevel);
    writeProfilePrivacyLevel(currentUser.privacyLevel);
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
        likeMate: currentUser?.likeMate,
        budgetLevel: currentUser?.budgetLevel,
      });

      return next;
    });
  }, [
    currentUser?.budgetLevel,
    currentUser?.city,
    currentUser?.favorGenres,
    currentUser?.likeMate,
    setStoreNotificationsEnabled,
  ]);

  const selectPrivacy = useCallback(
    (level: PrivacyLevel) => {
      setPrivacyLevel(level);
      setStorePrivacyLevel(level);
      writeProfilePrivacyLevel(level);
      void updateCurrentUserAndInvalidate({ privacyLevel: level })
        .then(() => {
          void Taro.showToast({ title: '已保存', icon: 'success' });
        })
        .catch(() => {
          void Taro.showToast({ title: '请求失败，请稍后重试', icon: 'none' });
        });
    },
    [setStorePrivacyLevel],
  );

  const privacyOptions: PrivacyLevel[] = ['public', 'friends', 'private'];

  return (
    <View data-cmp="Settings" className="s-settings">
      <PageNavigation
        title={SECTION_TITLES[section]}
        fallback={ROUTES.PROFILE}
        tone="surface"
      />

      <AccountRiskBanner accountRisk={accountRisk} />

      {section === 'blocked' ? (
        <ScrollView
          scrollY
          enhanced
          showScrollbar={false}
          className="s-settings__scroll s-scrollbar-none"
        >
          <View className="s-settings__main">
            <BlockedUsersSettings />
          </View>
        </ScrollView>
      ) : section === 'match' ? (
        <ScrollView
          scrollY
          enhanced
          showScrollbar={false}
          className="s-settings__scroll s-scrollbar-none"
        >
          <View className="s-settings__main">
            <MatchPreferencesSettings />
          </View>
        </ScrollView>
      ) : section === 'appeal' ? (
        <ScrollView
          scrollY
          enhanced
          showScrollbar={false}
          className="s-settings__scroll s-scrollbar-none"
        >
          <View className="s-settings__main">
            <AppealSettings />
          </View>
        </ScrollView>
      ) : (
        <View className="s-settings__main">
          {section === 'notifications' && (
            <View className="s-settings__card">
              <View className="s-settings__row">
                <View>
                  <View className="s-settings__row-label">推送通知</View>
                  <View className="s-settings__row-desc">接收活动提醒、互动消息等</View>
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
                  <View className="s-settings__row-label">活动提醒</View>
                  <View className="s-settings__row-desc">活动开始前 24 小时提醒</View>
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
                      {PRIVACY_LABELS[level]}
                    </View>
                    <View className="s-settings__option-desc">
                      {PRIVACY_DESCS[level]}
                    </View>
                  </View>
                  {privacyLevel === level && (
                    <Check size={20} className="s-settings__check" />
                  )}
                </Button>
              ))}
            </View>
          )}

          {section === 'legal' && (
            <View className="s-settings__card">
              {LEGAL_DOC_LIST.map((doc) => (
                <Button
                  key={doc.id}
                  className="s-settings__option"
                  onClick={() => goLegalDocument(doc.id)}
                >
                  <View>
                    <View className="s-settings__option-label">{doc.title}</View>
                    <View className="s-settings__option-desc">
                      更新于 {doc.updatedAt}
                    </View>
                  </View>
                  <ChevronRight size={18} color="#636366" />
                </Button>
              ))}
            </View>
          )}

          {section === 'help' && <HelpFeedbackSettings />}
        </View>
      )}
    </View>
  );
};

export default SettingsPage;
