import Taro, { useDidShow } from '@tarojs/taro';
import { useCallback, useEffect, useMemo, useRef } from 'react';
import { isLiveApi } from '../../constants/api';
import { useBlockedUsersQuery, useProfileSummaryQuery } from '../../hooks/useSyncApi';
import { useDeferredMount } from '../../hooks/useDeferredMount';
import type { ConfirmDialogOptions } from '../../hooks/useConfirmDialog';
import { useAuthSession } from '../../hooks/useAuthSession';
import { useEndRouteTransitionOnShow } from '../../hooks/useEndRouteTransitionOnShow';
import { useProfilePageStore } from '../../stores';
import { ensureAuth, logout } from '../../utils/auth';
import { requireAuth } from '../../utils/authGate';
import { shouldSkipAutoLogin } from '../../utils/authStorage';
import {
  invalidateProfilePackageState,
  invalidateProfileSummary,
} from '../../utils/queryInvalidation';
import {
  readProfileNotificationsEnabled,
  readProfilePrivacyLevel,
} from '../../utils/profileStorage';
import { go, preloadHotRoutes, ROUTES } from '../../utils/route';
import { DEFER_PROFILE_ENTITLEMENTS_MS } from '../../utils/timing';
import { persistUserName } from '../../utils/session';
import type { ProfileActivityItem } from '../../types/backend';
import { profileActivities, profilePosts, profileUser } from './mockData';
import type { PackageTierId } from './profilePackageData';
import type { ProfileSettingsSectionProps } from './ProfileSettingsSection';
import {
  normalizeProfileUserData,
  type ProfileDisplayUser,
} from './profileSummaryUtils';
import { countOngoingActivities, deriveInterestTag } from './utils';
import { useProfilePaidBenefitCards } from './useProfilePaidBenefitCards';
import { useProfilePackageSheet } from './useProfilePackageSheet';
import { useProfileBenefitsSection } from './useProfileBenefitsSection';
import {
  useProfileDebugOverlays,
  type ProfileDebugOverlayViewModel,
} from './useProfileDebugOverlays';

export type UseProfilePageOptions = {
  confirm: (options: ConfirmDialogOptions) => Promise<boolean>;
};

export type ProfileOverlaysViewModel = {
  packageSheetOpen: boolean;
  packageSheet: {
    activityLegacyId?: number;
    initialSelectedTierId?: PackageTierId;
    currentPaidTierId?: PackageTierId;
    activities: ProfileActivityItem[];
    activitiesLoading: boolean;
    paidTierByActivityLegacyId: Map<number, PackageTierId>;
    onClose: () => void;
    onPurchaseSuccess: () => void;
  };
  debug: ProfileDebugOverlayViewModel;
};

export function useProfilePage({ confirm }: UseProfilePageOptions) {
  const notificationsEnabled = useProfilePageStore(
    (state) => state.notificationsEnabled,
  );
  const setNotificationsEnabled = useProfilePageStore(
    (state) => state.setNotificationsEnabled,
  );
  const setPrivacyLevel = useProfilePageStore((state) => state.setPrivacyLevel);

  const openPackageSheetRef = useRef<
    (options?: { initialSelectedTierId?: PackageTierId }) => void
  >(() => {});

  const debug = useProfileDebugOverlays({
    openPackageSheet: (options) => openPackageSheetRef.current(options),
  });

  const summaryQuery = useProfileSummaryQuery();
  const blockedUsersQuery = useBlockedUsersQuery();
  const entitlementsReady = useDeferredMount(DEFER_PROFILE_ENTITLEMENTS_MS);
  const apiEnabled = isLiveApi();
  const { loggedIn, refresh: refreshAuthSession } = useAuthSession();
  const showGuestProfile = apiEnabled && !loggedIn;

  const profileUserData = useMemo(
    (): ProfileDisplayUser =>
      apiEnabled && summaryQuery.data
        ? normalizeProfileUserData(summaryQuery.data)
        : profileUser,
    [apiEnabled, summaryQuery.data],
  );

  const profileLoading =
    apiEnabled && loggedIn && summaryQuery.isLoading && !summaryQuery.data;

  const {
    benefitsLoading,
    paidEntitlements,
    recentPaidBenefitCards,
    totalPaidCardCount,
    entitlementsData: paidEntitlementsData,
    refetchEntitlements,
  } = useProfilePaidBenefitCards({
    useDebugEntitlements: debug.debugEntitlementsEnabled,
    debugPreset: debug.debugEntitlementPreset,
    entitlementsEnabled: entitlementsReady && loggedIn,
  });

  const packageSheet = useProfilePackageSheet({ paidEntitlements });
  openPackageSheetRef.current = packageSheet.openPackageSheet;

  const benefits = useProfileBenefitsSection({
    apiEnabled,
    debugEntitlementsEnabled: debug.debugEntitlementsEnabled,
    debugPreset: debug.debugEntitlementPreset,
    benefitsLoading,
    paidEntitlements,
    recentPaidBenefitCards,
    totalPaidCardCount,
    summaryData: summaryQuery.data,
    entitlementsData: paidEntitlementsData,
    onOpenPackageSheet: () => packageSheet.openPackageSheet(),
    onUpgrade: packageSheet.handleBenefitUpgrade,
  });

  const ongoingCount = apiEnabled
    ? profileUserData.stats.events
    : countOngoingActivities(profileActivities);
  const postsCount = apiEnabled ? profileUserData.stats.posts : profilePosts.length;
  const interestTag = deriveInterestTag(profileUserData.bio);

  useEndRouteTransitionOnShow();

  useDidShow(() => {
    preloadHotRoutes(ROUTES.PROFILE);
    setNotificationsEnabled(readProfileNotificationsEnabled());
    setPrivacyLevel(readProfilePrivacyLevel());
    packageSheet.applyRouteParams();
    if (apiEnabled && loggedIn) {
      void invalidateProfilePackageState();
      invalidateProfileSummary();
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
    (section: 'notifications' | 'privacy' | 'help' | 'blocked') => {
      go(`${ROUTES.SETTINGS}?section=${section}`);
    },
    [],
  );

  const handleAuthLoggedIn = useCallback(() => {
    refreshAuthSession();
    void invalidateProfilePackageState();
  }, [refreshAuthSession]);

  const handleProfileRetry = useCallback(() => {
    if (apiEnabled && loggedIn) {
      void invalidateProfilePackageState();
      void summaryQuery.refetch();
      void refetchEntitlements();
    }
  }, [apiEnabled, loggedIn, refetchEntitlements, summaryQuery]);

  const handleLogout = useCallback(async () => {
    const ok = await confirm({
      title: '退出登录',
      message: '确定要退出当前账号吗？退出后需重新登录才能使用个人功能。',
      confirmText: '退出登录',
    });
    if (!ok) return;
    await logout();
    refreshAuthSession();
    void Taro.showToast({ title: '已退出登录', icon: 'success' });
  }, [confirm, refreshAuthSession]);

  const blockedCount = blockedUsersQuery.data?.blockedUserIds?.length ?? 0;

  const settings: ProfileSettingsSectionProps = {
    notificationsEnabled,
    blockedCount,
    onOpenNotifications: () => openSettings('notifications'),
    onOpenPrivacy: () => openSettings('privacy'),
    onOpenBlockedUsers: () => {
      requireAuth(() => openSettings('blocked'), 'general');
    },
    onOpenHelp: () => openSettings('help'),
    onLogout: handleLogout,
  };

  const overlays: ProfileOverlaysViewModel = {
    packageSheetOpen: packageSheet.packageSheetOpen,
    packageSheet: packageSheet.packageSheet,
    debug: debug.debugOverlay,
  };

  return {
    showGuestProfile,
    profileLoading,
    profileUserData,
    interestTag,
    benefits,
    ongoingCount,
    postsCount,
    settings,
    debugSection: debug.debugSection,
    overlays,
    handleAuthLoggedIn,
    handleProfileRetry,
    openSettings,
  };
}
