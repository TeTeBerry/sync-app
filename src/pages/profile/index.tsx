import '../../components/profile/profile.scss';
import Taro, { useDidShow } from '@tarojs/taro';
import React, { useCallback, useEffect, useMemo, useState } from 'react';
import { FileText, Zap } from 'lucide-react-taro';
import TabPageHeader from '../../components/TabPageHeader';
import ThemedPageLoader from '../../components/ThemedPageLoader';
import { useNavBarInsets } from '../../hooks/useNavBarInsets';
import {
  TAB_PAGE_HEADER_BRAND_PX,
  useTabPageMainHeight,
} from '../../hooks/useTabPageMainHeight';
import { go, preloadHotRoutes, ROUTES } from '../../utils/route';
import ProfileGuestSection from '../../components/profile/ProfileGuestSection';
import ProfileBenefitsBlock from '../../components/profile/ProfileBenefitsBlock';
import ProfileDebugModalsHost from '../../components/profile/ProfileDebugModalsHost';
import ProfilePackageSheet from '../../components/profile/ProfilePackageSheet';
import { ProfileTabErrorBoundary } from '../../components/profile/ProfileTabErrorBoundary';
import { profileActivities, profilePosts, profileUser } from '../../components/profile/mockData';
import ProfileActionCard from '../../components/profile/ProfileActionCard';
import ProfileDebugSection from '../../components/profile/ProfileDebugSection';
import ProfileSettingsSection from '../../components/profile/ProfileSettingsSection';
import ProfileSummarySection from '../../components/profile/ProfileSummarySection';
import { normalizeProfileUserData } from '../../components/profile/profileSummaryUtils';
import { countOngoingActivities, deriveInterestTag } from '../../components/profile/utils';
import { ensureAuth, logout } from '../../utils/auth';
import { shouldSkipAutoLogin } from '../../utils/authStorage';
import { persistUserName } from '../../utils/session';
import { useNavigationStore, useProfilePageStore } from '../../stores';
import {
  useProfileActivitiesQuery,
  useProfileEntitlementsQuery,
  useProfileSummaryQuery,
} from '../../hooks/useSyncApi';
import { isApiEnabled } from '../../constants/api';
import { useConfirmDialog } from '../../hooks/useConfirmDialog';
import {
  readProfileNotificationsEnabled,
  readProfilePrivacyLevel,
} from '../../utils/profileStorage';
import { invalidateProfilePackageState } from '../../utils/queryInvalidation';
import {
  asEntitlementList,
  buildFreeBenefitCardModel,
  getNextTierId,
  isValidFreeMonthlyQuota,
  pickGlobalFreeMonthly,
  type ProfileEventBenefitCardModel,
} from '../../components/profile/profileBenefitsMapper';
import { useProfilePaidBenefitCards } from '../../components/profile/useProfilePaidBenefitCards';
import type { PackageTierId } from '../../components/profile/profilePackageData';
import {
  isProfileDebugEntitlementsEnabled,
  PROFILE_DEBUG_ENTITLEMENT_LABELS,
  persistProfileDebugEntitlementPreset,
  profileDebugEntitlementActionSheetItems,
  profileDebugPresetFromActionSheetIndex,
  readProfileDebugEntitlementPreset,
  resolveProfileDebugEntitlements,
  type ProfileDebugEntitlementPreset,
} from '../../components/profile/profileDebugEntitlements';
import { buildDebugContactUnlockExhaustedPreview } from '../../components/profile/profileDebugModals';
import { LoginInterceptHost } from '../../components/auth/LoginInterceptHost';
import { PROFILE_SEED_ACTIVITY_LEGACY_ID } from '../../constants/profilePackage';
import { useAuthSession } from '../../hooks/useAuthSession';
import { useEndRouteTransitionOnShow } from '../../hooks/useEndRouteTransitionOnShow';
import { ScrollView, View } from '@tarojs/components';

const Profile: React.FC = () => {
  const navInsets = useNavBarInsets();
  const headerChromePx = navInsets.paddingTop + TAB_PAGE_HEADER_BRAND_PX;
  const mainScrollHeight = useTabPageMainHeight(headerChromePx);
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
  const { confirm, confirmDialog } = useConfirmDialog({
    cancelText: '取消',
  });
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

  /** Global summary for profile tab (not scoped to AI/event context). */
  const summaryQuery = useProfileSummaryQuery();
  /** Unscoped list: one paid card per activity with a purchase. */
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
    () =>
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

  const freeBenefitCard = useMemo(() => {
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
      /** Pre-bound activity (paid benefit card / upgrade). Skips activity step in sheet. */
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

  return (
    <View data-cmp="Profile" className="s-profile s-page-with-tabbar">
      <View className="s-page-with-tabbar__main s-profile">
        <TabPageHeader className="s-tab-page-header--profile" navInsets={navInsets} />

        {showGuestProfile ? (
          <View className="s-profile__guest-body s-scrollbar-none">
            <ProfileTabErrorBoundary onRetry={handleProfileRetry}>
              <ProfileGuestSection
                onLoggedIn={handleAuthLoggedIn}
                onOpenHelp={() => openSettings('help')}
              />
            </ProfileTabErrorBoundary>
          </View>
        ) : (
        <ScrollView
          scrollY
          enhanced
          showScrollbar={false}
          className="s-profile__scroll s-scrollbar-none"
          style={
            mainScrollHeight != null ? { height: `${mainScrollHeight}px` } : undefined
          }
        >
          <ProfileTabErrorBoundary onRetry={handleProfileRetry}>
            <View className="s-profile__scroll-inner">
              {profileLoading ? (
                <View className="s-profile__card s-profile__card--loading">
                  <ThemedPageLoader
                    variant="inline"
                    label="加载个人资料…"
                    minHeight={148}
                  />
                </View>
              ) : (
                <>
                <ProfileSummarySection user={profileUserData} interestTag={interestTag} />

              <ProfileBenefitsBlock
                visible={showBenefitsBlock}
                showPaid={showPaidBenefitsSection}
                showFree={showFreeBenefitsSection}
                showFreeLoading={showBenefitsLoading}
                paidCards={recentPaidBenefitCards}
                totalPaidCount={totalPaidCardCount}
                benefitsLoading={benefitsLoading}
                freeCard={freeBenefitCard}
                onOpenPurchase={() => openPackageSheet()}
                onViewAllBenefits={() => go(ROUTES.PROFILE_BENEFITS)}
                onUpgrade={handleBenefitUpgrade}
                onUsageHistory={handleUsageHistory}
              />

              {debugEntitlementsEnabled ? (
                <ProfileDebugSection
                  preset={debugEntitlementPreset}
                  onSelectPreset={handleDebugEntitlements}
                  onPreviewContactUnlockExhausted={() =>
                    setDebugContactUnlockExhaustedOpen(true)
                  }
                  onPreviewAiMatchExhausted={() => setDebugAiMatchExhaustedOpen(true)}
                />
              ) : null}

              <ProfileActionCard
                accent="activities"
                icon={<Zap size={20} />}
                title="我的活动"
                badge={ongoingCount}
                subtitle={`${ongoingCount} 个进行中的活动`}
                onClick={() => go(ROUTES.PROFILE_ACTIVITIES)}
              />
              <ProfileActionCard
                accent="posts"
                icon={<FileText size={20} />}
                title="我的帖子"
                badge={postsCount}
                subtitle={`${postsCount} 篇发布的帖子`}
                onClick={() => go(ROUTES.PROFILE_POSTS)}
              />

              <ProfileSettingsSection
                notificationsEnabled={notificationsEnabled}
                onOpenNotifications={() => openSettings('notifications')}
                onOpenPrivacy={() => openSettings('privacy')}
                onOpenHelp={() => openSettings('help')}
                onLogout={handleLogout}
              />

              <View className="s-profile__scroll-spacer" />
                </>
              )}
            </View>
          </ProfileTabErrorBoundary>
        </ScrollView>
        )}
      </View>

      {confirmDialog}
      <LoginInterceptHost />
      {debugEntitlementsEnabled ? (
        <ProfileDebugModalsHost
          contactUnlockOpen={debugContactUnlockExhaustedOpen}
          aiMatchOpen={debugAiMatchExhaustedOpen}
          preview={debugContactUnlockPreview}
          activityLegacyId={PROFILE_SEED_ACTIVITY_LEGACY_ID}
          onCloseContactUnlock={() => setDebugContactUnlockExhaustedOpen(false)}
          onCloseAiMatch={() => setDebugAiMatchExhaustedOpen(false)}
          onUpgradeContactUnlock={(tierId) => {
            setDebugContactUnlockExhaustedOpen(false);
            openPackageSheet({ initialSelectedTierId: tierId });
          }}
          onViewAllBenefits={() => {
            setDebugAiMatchExhaustedOpen(false);
            go(ROUTES.PROFILE_BENEFITS);
          }}
        />
      ) : null}
      {packageSheetOpen ? (
        <ProfilePackageSheet
          open
          activityLegacyId={packageSheetActivityLegacyId}
          initialSelectedTierId={packageSheetInitialTierId}
          currentPaidTierId={packageSheetResolvedCurrentPaidTierId}
          activities={profileActivitiesList}
          activitiesLoading={apiEnabled && activitiesQuery.isLoading}
          paidTierByActivityLegacyId={paidTierByActivityLegacyId}
          onClose={closePackageSheet}
          onPurchaseSuccess={() => {
            void invalidateProfilePackageState();
          }}
        />
      ) : null}
    </View>
  );
};

export default Profile;
