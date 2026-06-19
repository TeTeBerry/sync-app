import Taro, { useDidShow } from '@tarojs/taro';
import { useCallback, useEffect, useMemo } from 'react';
import { isLiveApi } from '../../constants/api';
import { useAccountRisk } from '../../hooks/useAccountRisk';
import { useCurrentUserQuery, useProfileSummaryQuery } from '../../hooks/useSyncApi';
import type { ConfirmDialogOptions } from '../../hooks/useConfirmDialog';
import { useAuthSession } from '../../hooks/useAuthSession';
import { useEndRouteTransitionOnShow } from '../../hooks/useEndRouteTransitionOnShow';
import { useProfilePageStore } from '../../stores';
import { ensureAuth, logout } from '../../utils/auth';
import { requireAuth } from '../../utils/authGate';
import { shouldSkipAutoLogin } from '../../utils/authStorage';
import { invalidateProfileSummary } from '../../utils/queryInvalidation';
import {
  readProfileNotificationsEnabled,
  readProfilePrivacyLevel,
} from '../../utils/profileStorage';
import { go, preloadHotRoutes, ROUTES } from '../../utils/route';
import { persistUserName } from '../../utils/session';
import type { ProfileSummary } from '../../types/backend';
import type { ProfileSettingsSectionProps } from './ProfileSettingsSection';
import {
  accountRiskStatusTitle,
  formatAccountRiskUntil,
} from '../../utils/accountRiskDisplay';
import { isAccountPublishRestricted } from '../../utils/accountRisk';
import {
  normalizeProfileUserData,
  type ProfileDisplayUser,
} from './profileSummaryUtils';
import { formatBuddyPreferencesSummary } from '../../constants/buddyPreferences';
import { deriveInterestTag } from './utils';
import { applyPersonalityTestIdentity } from '../../utils/displayUserIdentity';
import { t } from '@/i18n';

export type UseProfilePageOptions = {
  confirm: (options: ConfirmDialogOptions) => Promise<boolean>;
};

export function useProfilePage({ confirm }: UseProfilePageOptions) {
  const notificationsEnabled = useProfilePageStore(
    (state) => state.notificationsEnabled,
  );
  const setNotificationsEnabled = useProfilePageStore(
    (state) => state.setNotificationsEnabled,
  );
  const setPrivacyLevel = useProfilePageStore((state) => state.setPrivacyLevel);

  const summaryQuery = useProfileSummaryQuery();
  const currentUserQuery = useCurrentUserQuery();
  const { accountRisk } = useAccountRisk();
  const apiEnabled = isLiveApi();
  const { loggedIn, refresh: refreshAuthSession } = useAuthSession();
  const showGuestProfile = apiEnabled && !loggedIn;

  const profileUserData = useMemo((): ProfileDisplayUser => {
    const base = normalizeProfileUserData((summaryQuery.data ?? {}) as ProfileSummary);
    return applyPersonalityTestIdentity(base);
  }, [summaryQuery.data]);

  const profileLoading =
    apiEnabled && loggedIn && summaryQuery.isLoading && !summaryQuery.data;

  const ongoingCount = profileUserData.stats.events;
  const postsCount = profileUserData.stats.posts;
  const interestTag = deriveInterestTag(profileUserData.bio);

  useEndRouteTransitionOnShow(ROUTES.PROFILE);

  useDidShow(() => {
    preloadHotRoutes(ROUTES.PROFILE);
    setNotificationsEnabled(readProfileNotificationsEnabled());
    setPrivacyLevel(readProfilePrivacyLevel());
    if (apiEnabled && loggedIn) {
      void summaryQuery.refetch({ background: true });
      void currentUserQuery.refetch({ background: true });
      return;
    }
    if (apiEnabled && !loggedIn && !shouldSkipAutoLogin()) {
      void ensureAuth().then((result) => {
        if (result) refreshAuthSession();
      });
    }
  });

  useEffect(() => {
    persistUserName(profileUserData.name);
  }, [profileUserData.name]);

  const openSettings = useCallback(
    (
      section:
        | 'notifications'
        | 'privacy'
        | 'help'
        | 'legal'
        | 'buddy-prefs'
        | 'appeal'
        | 'language',
    ) => {
      go(`${ROUTES.SETTINGS}?section=${section}`);
    },
    [],
  );

  const handleAuthLoggedIn = useCallback(() => {
    refreshAuthSession();
    invalidateProfileSummary();
  }, [refreshAuthSession]);

  const handleProfileRetry = useCallback(() => {
    if (apiEnabled && loggedIn) {
      invalidateProfileSummary();
      void summaryQuery.refetch();
    }
  }, [apiEnabled, loggedIn, summaryQuery]);

  import { t } from '@/i18n';

  const handleLogout = useCallback(async () => {
    const ok = await confirm({
      title: t('profile.logout.title'),
      message: t('profile.logout.message'),
      confirmText: t('profile.logout.confirm'),
    });
    if (!ok) return;
    await logout();
    refreshAuthSession();
    void Taro.showToast({ title: t('profile.logout.done'), icon: 'success' });
  }, [confirm, refreshAuthSession]);

  const buddyPreferencesSummary = formatBuddyPreferencesSummary(
    currentUserQuery.data ?? null,
  );

  const publishRestricted = isAccountPublishRestricted(accountRisk);
  const untilLabel = formatAccountRiskUntil(accountRisk?.postBlockedUntil);

  const settings: ProfileSettingsSectionProps = {
    notificationsEnabled,
    buddyPreferencesSummary,
    showAccountStatusRow: publishRestricted,
    accountStatusSummary: untilLabel
      ? `${accountRiskStatusTitle(accountRisk)} · ${untilLabel}`
      : accountRiskStatusTitle(accountRisk),
    onOpenNotifications: () => openSettings('notifications'),
    onOpenBuddyPreferences: () => {
      requireAuth(() => openSettings('buddy-prefs'), 'general');
    },
    onOpenPrivacy: () => openSettings('privacy'),
    onOpenLanguage: () => openSettings('language'),
    onOpenAccountAppeal: () => {
      requireAuth(() => openSettings('appeal'), 'general');
    },
    onOpenHelp: () => openSettings('help'),
    onOpenLegal: () => openSettings('legal'),
    onLogout: handleLogout,
  };

  return {
    showGuestProfile,
    profileLoading,
    profileUserData,
    interestTag,
    ongoingCount,
    postsCount,
    accountRisk,
    settings,
    handleAuthLoggedIn,
    handleProfileRetry,
    openSettings,
  };
}
