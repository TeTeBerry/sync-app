import Taro, { useDidShow } from '@tarojs/taro';
import { useCallback, useEffect, useMemo, useState } from 'react';
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
import { go, preloadHotRoutes, ROUTES, goPersonalityTest } from '../../utils/route';
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
import { restorePersonalityTestResultFromServer } from '@/domains/personality-test/utils/personalityTestStorage';
import { t } from '@/i18n';
import { usePersonalityTestResult } from '../../hooks/usePersonalityTestResult';
import { useStaleBackgroundRefetch } from '../../hooks/useStaleBackgroundRefetch';
import { getResolvedAuthUserId } from '../../utils/authStorage';
import {
  dismissProfilePersonalityNudge,
  isProfilePersonalityNudgeDismissed,
} from './utils/profilePersonalityNudgeStorage';

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
  const personalityResult = usePersonalityTestResult();
  const authUserId = getResolvedAuthUserId();
  const personalityCompleted = Boolean(personalityResult?.score?.primaryType);
  const [personalityNudgeDismissed, setPersonalityNudgeDismissed] = useState(() =>
    authUserId ? isProfilePersonalityNudgeDismissed(authUserId) : false,
  );
  const { accountRisk } = useAccountRisk();
  const apiEnabled = isLiveApi();
  const { loggedIn, refresh: refreshAuthSession } = useAuthSession();
  const showGuestProfile = apiEnabled && !loggedIn;

  const profileUserData = useMemo((): ProfileDisplayUser => {
    const base = normalizeProfileUserData((summaryQuery.data ?? {}) as ProfileSummary);
    return applyPersonalityTestIdentity(base, personalityResult);
  }, [personalityResult, summaryQuery.data]);

  const profileLoading =
    apiEnabled && loggedIn && summaryQuery.isLoading && !summaryQuery.data;

  const ongoingCount = profileUserData.stats.events;
  const postsCount = profileUserData.stats.posts;
  const interestTag = deriveInterestTag(profileUserData.bio);
  const showPersonalityNudge =
    loggedIn && !personalityCompleted && !personalityNudgeDismissed;
  const activitiesSubtitle =
    ongoingCount > 0
      ? t('profile.ongoingActivities', { count: ongoingCount })
      : t('profile.noActivitiesYet');
  const postsSubtitle =
    postsCount > 0
      ? t('profile.postCount', { count: postsCount })
      : t('profile.noPostsYet');

  useEndRouteTransitionOnShow(ROUTES.PROFILE);

  useStaleBackgroundRefetch({
    refetch: summaryQuery.refetch,
    queryKey: ['profile', 'summary'],
    staleTime: 60_000,
    enabled: apiEnabled && loggedIn,
  });
  useStaleBackgroundRefetch({
    refetch: currentUserQuery.refetch,
    queryKey: ['users', 'me'],
    staleTime: 60_000,
    enabled: apiEnabled && loggedIn,
  });

  useDidShow(() => {
    preloadHotRoutes(ROUTES.PROFILE);
    setNotificationsEnabled(readProfileNotificationsEnabled());
    setPrivacyLevel(readProfilePrivacyLevel());
    if (apiEnabled && loggedIn) {
      void restorePersonalityTestResultFromServer();
    } else if (apiEnabled && !loggedIn && !shouldSkipAutoLogin()) {
      void ensureAuth().then((result) => {
        if (result) refreshAuthSession();
      });
    }
  });

  useEffect(() => {
    if (!authUserId) {
      setPersonalityNudgeDismissed(false);
      return;
    }
    setPersonalityNudgeDismissed(isProfilePersonalityNudgeDismissed(authUserId));
  }, [authUserId]);

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

  const handleDismissPersonalityNudge = useCallback(() => {
    if (authUserId) {
      dismissProfilePersonalityNudge(authUserId);
    }
    setPersonalityNudgeDismissed(true);
  }, [authUserId]);

  const handleStartPersonalityTest = useCallback(() => {
    goPersonalityTest();
  }, []);

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
    activitiesSubtitle,
    postsSubtitle,
    showPersonalityNudge,
    accountRisk,
    settings,
    handleAuthLoggedIn,
    handleProfileRetry,
    handleDismissPersonalityNudge,
    handleStartPersonalityTest,
    openSettings,
  };
}
