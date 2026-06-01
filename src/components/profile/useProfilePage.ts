import Taro, { useDidShow } from '@tarojs/taro';
import { useCallback, useEffect, useMemo, useState } from 'react';
import { isApiEnabled } from '../../constants/api';
import { PROFILE_SEED_ACTIVITY_LEGACY_ID } from '../../constants/profilePackage';
import {
  useProfileActivitiesQuery,
  useProfileEntitlementsQuery,
  useProfileSummaryQuery,
} from '../../hooks/useSyncApi';
import type { ConfirmDialogOptions } from '../../hooks/useConfirmDialog';
import { useAuthSession } from '../../hooks/useAuthSession';
import { useEndRouteTransitionOnShow } from '../../hooks/useEndRouteTransitionOnShow';
import { useNavigationStore, useProfilePageStore } from '../../stores';
import { ensureAuth, logout } from '../../utils/auth';
import { shouldSkipAutoLogin } from '../../utils/authStorage';
import { invalidateProfilePackageState } from '../../utils/queryInvalidation';
import {
  readProfileNotificationsEnabled,
  readProfilePrivacyLevel,
} from '../../utils/profileStorage';
import { go, preloadHotRoutes, ROUTES } from '../../utils/route';
import { persistUserName } from '../../utils/session';
import type { ProfileActivityItem } from '../../types/backend';
import { profileActivities, profilePosts, profileUser } from './mockData';
import {
  asEntitlementList,
  buildFreeBenefitCardModel,
  getNextTierId,
  isValidFreeMonthlyQuota,
  pickGlobalFreeMonthly,
  type ProfileEventBenefitCardModel,
  type ProfileFreeBenefitCardModel,
} from './profileBenefitsMapper';
import type { PackageTierId } from './profilePackageData';
import {
  isProfileDebugEntitlementsEnabled,
  PROFILE_DEBUG_ENTITLEMENT_LABELS,
  persistProfileDebugEntitlementPreset,
  profileDebugEntitlementActionSheetItems,
  profileDebugPresetFromActionSheetIndex,
  readProfileDebugEntitlementPreset,
  resolveProfileDebugEntitlements,
  type ProfileDebugEntitlementPreset,
} from './profileDebugEntitlements';
import { buildDebugContactUnlockExhaustedPreview } from './profileDebugModals';
import type { ProfileBenefitsBlockProps } from './ProfileBenefitsBlock';
import type { ProfileDebugSectionProps } from './ProfileDebugSection';
import type { ProfileSettingsSectionProps } from './ProfileSettingsSection';
import {
  normalizeProfileUserData,
  type ProfileDisplayUser,
} from './profileSummaryUtils';
import { countOngoingActivities, deriveInterestTag } from './utils';
import { useProfilePaidBenefitCards } from './useProfilePaidBenefitCards';

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
  debug: {
    enabled: boolean;
    contactUnlockOpen: boolean;
    aiMatchOpen: boolean;
    preview: ReturnType<typeof buildDebugContactUnlockExhaustedPreview>;
    activityLegacyId: number;
    onCloseContactUnlock: () => void;
    onCloseAiMatch: () => void;
    onUpgradeContactUnlock: (tierId: PackageTierId) => void;
    onViewAllBenefits: () => void;
  };
};

export function useProfilePage({ confirm }: UseProfilePageOptions) {
  const notificationsEnabled = useProfilePageStore(
    (state) => state.notificationsEnabled,
  );
  const setNotificationsEnabled = useProfilePageStore(
    (state) => state.setNotificationsEnabled,
  );
  const setPrivacyLevel = useProfilePageStore((state) => state.setPrivacyLevel);
  const consumeProfileIntent = useNavigationStore(
    (state) => state.consumeProfileIntent,
  );

  const [packageSheetOpen, setPackageSheetOpen] = useState(false);
  const [packageSheetActivityLegacyId, setPackageSheetActivityLegacyId] = useState<
    number | undefined
  >(undefined);
  const [packageSheetInitialTierId, setPackageSheetInitialTierId] = useState<
    PackageTierId | undefined
  >(undefined);
  const [packageSheetCurrentPaidTierId, setPackageSheetCurrentPaidTierId] = useState<
    PackageTierId | undefined
  >(undefined);
  const debugEntitlementsEnabled = isProfileDebugEntitlementsEnabled();
  const [debugEntitlementPreset, setDebugEntitlementPreset] =
    useState<ProfileDebugEntitlementPreset>(() => readProfileDebugEntitlementPreset());
  const [debugContactUnlockExhaustedOpen, setDebugContactUnlockExhaustedOpen] =
    useState(false);
  const [debugAiMatchExhaustedOpen, setDebugAiMatchExhaustedOpen] = useState(false);
  const debugContactUnlockPreview = useMemo(
    () => buildDebugContactUnlockExhaustedPreview(),
    [],
  );

  const summaryQuery = useProfileSummaryQuery();
  const allEntitlementsQuery = useProfileEntitlementsQuery();
  const activitiesQuery = useProfileActivitiesQuery();
  const apiEnabled = isApiEnabled();
  const { loggedIn, refresh: refreshAuthSession } = useAuthSession();
  const showGuestProfile = apiEnabled && !loggedIn;

  const debugEntitlementOverride = useMemo(
    () =>
      debugEntitlementsEnabled
        ? resolveProfileDebugEntitlements(debugEntitlementPreset)
        : null,
    [debugEntitlementPreset, debugEntitlementsEnabled],
  );

  const profileUserData = useMemo(
    (): ProfileDisplayUser =>
      apiEnabled && summaryQuery.data
        ? normalizeProfileUserData(summaryQuery.data)
        : profileUser,
    [apiEnabled, summaryQuery.data],
  );

  const entitlementList = useMemo(
    () => asEntitlementList(allEntitlementsQuery.data),
    [allEntitlementsQuery.data],
  );

  const profileLoading =
    apiEnabled && loggedIn && summaryQuery.isLoading && !summaryQuery.data;

  const {
    benefitsLoading,
    paidEntitlements,
    recentPaidBenefitCards,
    totalPaidCardCount,
  } = useProfilePaidBenefitCards({
    useDebugEntitlements: debugEntitlementsEnabled,
    debugPreset: debugEntitlementPreset,
  });

  const summaryFreeMonthly = useMemo(() => {
    const scoped = summaryQuery.data?.packageEntitlement?.freeMonthly;
    if (isValidFreeMonthlyQuota(scoped)) {
      return scoped;
    }
    for (const item of asEntitlementList(summaryQuery.data?.packageEntitlements)) {
      if (isValidFreeMonthlyQuota(item.freeMonthly)) {
        return item.freeMonthly;
      }
    }
    return undefined;
  }, [summaryQuery.data]);

  const globalFreeMonthly = useMemo(() => {
    if (debugEntitlementOverride) {
      return debugEntitlementOverride.freeMonthly;
    }
    return pickGlobalFreeMonthly(entitlementList, summaryFreeMonthly);
  }, [debugEntitlementOverride, entitlementList, summaryFreeMonthly]);

  const profileActivitiesList = useMemo(() => {
    if (apiEnabled && activitiesQuery.data?.length) {
      return activitiesQuery.data;
    }
    return profileActivities;
  }, [activitiesQuery.data, apiEnabled]);

  const paidTierByActivityLegacyId = useMemo(() => {
    const map = new Map<number, PackageTierId>();
    for (const entitlement of paidEntitlements) {
      if (entitlement.paidTierId) {
        map.set(entitlement.activityLegacyId, entitlement.paidTierId);
      }
    }
    return map;
  }, [paidEntitlements]);

  const hasPaidEntitlement = paidEntitlements.length > 0;
  const showPaidBenefitsSection = !apiEnabled || hasPaidEntitlement;
  const showFreeBenefitsSection =
    paidEntitlements.length === 0 &&
    (debugEntitlementOverride != null || !benefitsLoading);
  const showBenefitsLoading = benefitsLoading && !showPaidBenefitsSection;
  const showBenefitsBlock =
    showPaidBenefitsSection || showFreeBenefitsSection || showBenefitsLoading;

  const freeBenefitCard = useMemo((): ProfileFreeBenefitCardModel | null => {
    if (!showFreeBenefitsSection) {
      return null;
    }
    return buildFreeBenefitCardModel(globalFreeMonthly);
  }, [globalFreeMonthly, showFreeBenefitsSection]);

  const ongoingCount = apiEnabled
    ? profileUserData.stats.events
    : countOngoingActivities(profileActivities);
  const postsCount = apiEnabled ? profileUserData.stats.posts : profilePosts.length;
  const interestTag = deriveInterestTag(profileUserData.bio);

  const openPackageSheet = useCallback(
    (options?: {
      activityLegacyId?: number;
      initialSelectedTierId?: PackageTierId;
      currentPaidTierId?: PackageTierId;
    }) => {
      const rawActivityId = options?.activityLegacyId;
      const resolvedActivityId =
        rawActivityId != null && !Number.isNaN(rawActivityId)
          ? rawActivityId
          : undefined;
      let currentPaidTierId = options?.currentPaidTierId;
      if (currentPaidTierId == null && resolvedActivityId != null) {
        const entitlement = paidEntitlements.find(
          (item) => item.activityLegacyId === resolvedActivityId,
        );
        currentPaidTierId = entitlement?.paidTierId ?? undefined;
      }
      setPackageSheetActivityLegacyId(resolvedActivityId);
      setPackageSheetInitialTierId(options?.initialSelectedTierId);
      setPackageSheetCurrentPaidTierId(currentPaidTierId);
      setPackageSheetOpen(true);
    },
    [paidEntitlements],
  );

  const closePackageSheet = useCallback(() => {
    setPackageSheetOpen(false);
    setPackageSheetActivityLegacyId(undefined);
    setPackageSheetInitialTierId(undefined);
    setPackageSheetCurrentPaidTierId(undefined);
  }, []);

  const packageSheetResolvedCurrentPaidTierId = useMemo(() => {
    if (packageSheetCurrentPaidTierId != null) {
      return packageSheetCurrentPaidTierId;
    }
    if (packageSheetActivityLegacyId == null) {
      return undefined;
    }
    const entitlement = paidEntitlements.find(
      (item) => item.activityLegacyId === packageSheetActivityLegacyId,
    );
    return entitlement?.paidTierId ?? undefined;
  }, [packageSheetActivityLegacyId, packageSheetCurrentPaidTierId, paidEntitlements]);

  const handleBenefitUpgrade = useCallback(
    (card: ProfileEventBenefitCardModel) => {
      const nextTierId = getNextTierId(card.tierId);
      if (!nextTierId) {
        return;
      }
      openPackageSheet({
        activityLegacyId: card.activityLegacyId,
        initialSelectedTierId: nextTierId,
        currentPaidTierId: card.tierId,
      });
    },
    [openPackageSheet],
  );

  const applyRouteParams = useCallback(() => {
    const intent = consumeProfileIntent();
    if (intent?.openPackageSheet) {
      openPackageSheet();
    }
  }, [consumeProfileIntent, openPackageSheet]);

  useEffect(() => {
    applyRouteParams();
  }, [applyRouteParams]);

  useEndRouteTransitionOnShow();

  useDidShow(() => {
    preloadHotRoutes();
    setNotificationsEnabled(readProfileNotificationsEnabled());
    setPrivacyLevel(readProfilePrivacyLevel());
    applyRouteParams();
    if (apiEnabled && loggedIn) {
      void invalidateProfilePackageState();
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

  const openSettings = useCallback((section: 'notifications' | 'privacy' | 'help') => {
    go(`${ROUTES.SETTINGS}?section=${section}`);
  }, []);

  const handleAuthLoggedIn = useCallback(() => {
    refreshAuthSession();
    void invalidateProfilePackageState();
  }, [refreshAuthSession]);

  const handleProfileRetry = useCallback(() => {
    if (apiEnabled && loggedIn) {
      void invalidateProfilePackageState();
      void summaryQuery.refetch();
      void allEntitlementsQuery.refetch();
      void activitiesQuery.refetch();
    }
  }, [activitiesQuery, allEntitlementsQuery, apiEnabled, loggedIn, summaryQuery]);

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

  const handleUsageHistory = useCallback(() => {
    void Taro.showToast({ title: '使用记录敬请期待', icon: 'none' });
  }, []);

  const handleDebugEntitlements = useCallback(() => {
    if (!debugEntitlementsEnabled) return;
    void Taro.showActionSheet({
      itemList: profileDebugEntitlementActionSheetItems(),
      success: (res) => {
        const preset = profileDebugPresetFromActionSheetIndex(res.tapIndex);
        persistProfileDebugEntitlementPreset(preset);
        setDebugEntitlementPreset(preset);
        void Taro.showToast({
          title: PROFILE_DEBUG_ENTITLEMENT_LABELS[preset],
          icon: 'none',
        });
      },
    });
  }, [debugEntitlementsEnabled]);

  const benefits: ProfileBenefitsBlockProps = {
    visible: showBenefitsBlock,
    showPaid: showPaidBenefitsSection,
    showFree: showFreeBenefitsSection,
    showFreeLoading: showBenefitsLoading,
    paidCards: recentPaidBenefitCards,
    totalPaidCount: totalPaidCardCount,
    benefitsLoading,
    freeCard: freeBenefitCard,
    onOpenPurchase: () => openPackageSheet(),
    onViewAllBenefits: () => go(ROUTES.PROFILE_BENEFITS),
    onUpgrade: handleBenefitUpgrade,
    onUsageHistory: handleUsageHistory,
  };

  const settings: ProfileSettingsSectionProps = {
    notificationsEnabled,
    onOpenNotifications: () => openSettings('notifications'),
    onOpenPrivacy: () => openSettings('privacy'),
    onOpenHelp: () => openSettings('help'),
    onLogout: handleLogout,
  };

  const debugSection: ProfileDebugSectionProps | null = debugEntitlementsEnabled
    ? {
        preset: debugEntitlementPreset,
        onSelectPreset: handleDebugEntitlements,
        onPreviewContactUnlockExhausted: () => setDebugContactUnlockExhaustedOpen(true),
        onPreviewAiMatchExhausted: () => setDebugAiMatchExhaustedOpen(true),
      }
    : null;

  const overlays: ProfileOverlaysViewModel = {
    packageSheetOpen,
    packageSheet: {
      activityLegacyId: packageSheetActivityLegacyId,
      initialSelectedTierId: packageSheetInitialTierId,
      currentPaidTierId: packageSheetResolvedCurrentPaidTierId,
      activities: profileActivitiesList,
      activitiesLoading: apiEnabled && activitiesQuery.isLoading,
      paidTierByActivityLegacyId,
      onClose: closePackageSheet,
      onPurchaseSuccess: () => {
        void invalidateProfilePackageState();
      },
    },
    debug: {
      enabled: debugEntitlementsEnabled,
      contactUnlockOpen: debugContactUnlockExhaustedOpen,
      aiMatchOpen: debugAiMatchExhaustedOpen,
      preview: debugContactUnlockPreview,
      activityLegacyId: PROFILE_SEED_ACTIVITY_LEGACY_ID,
      onCloseContactUnlock: () => setDebugContactUnlockExhaustedOpen(false),
      onCloseAiMatch: () => setDebugAiMatchExhaustedOpen(false),
      onUpgradeContactUnlock: (tierId) => {
        setDebugContactUnlockExhaustedOpen(false);
        openPackageSheet({ initialSelectedTierId: tierId });
      },
      onViewAllBenefits: () => {
        setDebugAiMatchExhaustedOpen(false);
        go(ROUTES.PROFILE_BENEFITS);
      },
    },
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
    debugSection,
    overlays,
    handleAuthLoggedIn,
    handleProfileRetry,
    openSettings,
  };
}
