import './profile.scss';
import Taro, { useDidShow } from '@tarojs/taro';
import React, { useCallback, useEffect, useMemo, useState } from 'react';
import {
  Bell,
  Check,
  ChevronRight,
  FileText,
  Info,
  LogOut,
  Music2,
  Shield,
  Zap,
} from 'lucide-react-taro';
import TabPageHeader from '../../components/TabPageHeader';
import ThemedPageLoader from '../../components/ThemedPageLoader';
import { useNavBarInsets } from '../../hooks/useNavBarInsets';
import {
  TAB_PAGE_HEADER_BRAND_PX,
  useTabPageMainHeight,
} from '../../hooks/useTabPageMainHeight';
import { go, preloadHotRoutes, ROUTES } from '../../utils/route';
import ProfileBenefitsPurchaseBanner from './components/ProfileBenefitsPurchaseBanner';
import ProfileFreeBenefitsSection from './components/ProfileFreeBenefitsSection';
import ProfilePaidBenefitsSection from './components/ProfilePaidBenefitsSection';
import ProfilePackageSheet from './components/ProfilePackageSheet';
import { ProfileTabErrorBoundary } from './components/ProfileTabErrorBoundary';
import { profileActivities, profilePosts, profileUser } from './mockData';
import { sanitizeRemoteImageUrl } from '../../utils/imageUrl';
import ProfileActionCard from './components/ProfileActionCard';
import { countOngoingActivities, deriveInterestTag } from './utils';
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
import type { ProfileSummary } from '../../types/backend';
import {
  asEntitlementList,
  buildFreeBenefitCardModel,
  getNextTierId,
  isValidFreeMonthlyQuota,
  pickGlobalFreeMonthly,
  type ProfileEventBenefitCardModel,
} from './profileBenefitsMapper';
import { useProfilePaidBenefitCards } from './useProfilePaidBenefitCards';
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
import { ContactUnlockQuotaExhaustedModal } from '../../components/contact-unlock/ContactUnlockQuotaExhaustedModal';
import AiPackageUpgradeSheet from '../../components/ai-chat/AiPackageUpgradeSheet';
import { PROFILE_SEED_ACTIVITY_LEGACY_ID } from '../../constants/profilePackage';
import { useEndRouteTransitionOnShow } from '../../hooks/useEndRouteTransitionOnShow';
import { Image, ScrollView, Text, View } from '@tarojs/components';

function trimProfileField(value: unknown): string | undefined {
  if (typeof value !== 'string') {
    return undefined;
  }
  const trimmed = value.trim();
  return trimmed.length > 0 ? trimmed : undefined;
}

function normalizeProfileUserData(
  data: ProfileSummary | typeof profileUser,
): typeof profileUser {
  const stats = data.stats ?? profileUser.stats;
  return {
    name: trimProfileField(data.name) ?? profileUser.name,
    handle: trimProfileField(data.handle) ?? profileUser.handle,
    location: trimProfileField(data.location) ?? profileUser.location,
    bio: trimProfileField(data.bio) ?? profileUser.bio,
    avatar: trimProfileField(data.avatar) ?? profileUser.avatar,
    verified:
      'verified' in data && typeof data.verified === 'boolean'
        ? data.verified
        : profileUser.verified,
    stats: {
      events: Number(stats.events) || 0,
      matchSuccess: Number(stats.matchSuccess) || 0,
      likes: Number(stats.likes) || 0,
      posts: Number(stats.posts) || 0,
    },
  };
}

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

  const profileLoading = apiEnabled && summaryQuery.isLoading && !summaryQuery.data;

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
  const verified = profileUserData.verified;

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
    if (apiEnabled) {
      void invalidateProfilePackageState();
    }
  });

  useEffect(() => {
    persistUserName(profileUserData.name);
  }, [profileUserData.name]);

  const openSettings = useCallback((section: 'notifications' | 'privacy' | 'help') => {
    go(`${ROUTES.SETTINGS}?section=${section}`);
  }, []);

  const handleProfileRetry = useCallback(() => {
    if (apiEnabled) {
      void invalidateProfilePackageState();
      void summaryQuery.refetch();
      void allEntitlementsQuery.refetch();
      void activitiesQuery.refetch();
    }
  }, [activitiesQuery, allEntitlementsQuery, apiEnabled, summaryQuery]);

  const handleLogout = useCallback(async () => {
    const ok = await confirm({
      title: '退出登录',
      message: '确定要退出当前账号吗？',
      confirmText: '退出登录',
    });
    if (!ok) return;
    void Taro.showToast({ title: '已退出登录', icon: 'success' });
  }, [confirm]);

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

  const metaParts = [
    profileUserData.handle,
    profileUserData.location,
    profileUserData.bio,
  ].filter(Boolean);

  return (
    <View data-cmp="Profile" className="s-profile s-page-with-tabbar">
      <View className="s-page-with-tabbar__main s-profile">
        <TabPageHeader className="s-tab-page-header--profile" navInsets={navInsets} />

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
                <View className="s-profile__card">
                  <View className="s-profile__card-top">
                    <View className="s-profile__avatar-wrap">
                      <Image
                        className="s-profile__avatar"
                        src={
                          sanitizeRemoteImageUrl(profileUserData.avatar) ??
                          profileUserData.avatar
                        }
                        alt={profileUserData.name}
                      />
                      <View className="s-profile__online-dot" aria-label="在线" />
                    </View>

                    <View className="s-profile__info">
                      <Text className="s-profile__name">{profileUserData.name}</Text>
                      {metaParts.length > 0 ? (
                        <Text className="s-profile__meta-line">
                          {metaParts.join(' · ')}
                        </Text>
                      ) : null}
                      {interestTag || verified ? (
                        <View className="s-profile__tags">
                          {interestTag ? (
                            <View className="s-profile__tag s-profile__tag--primary">
                              <Music2 size={12} />
                              <Text>{interestTag}</Text>
                            </View>
                          ) : null}
                          {verified ? (
                            <View className="s-profile__tag s-profile__tag--verified">
                              <Check size={12} strokeWidth={3} />
                              <Text>已认证</Text>
                            </View>
                          ) : null}
                        </View>
                      ) : null}
                    </View>
                  </View>

                  <View className="s-profile__stats" aria-label="个人数据">
                    <View className="s-profile__stat">
                      <Text className="s-profile__stat-value">
                        {profileUserData.stats.events}
                      </Text>
                      <Text className="s-profile__stat-label">参加活动</Text>
                    </View>
                    <View className="s-profile__stat s-profile__stat--accent">
                      <Text className="s-profile__stat-value">
                        {profileUserData.stats.matchSuccess}
                      </Text>
                      <Text className="s-profile__stat-label">组队成功</Text>
                    </View>
                    <View className="s-profile__stat">
                      <Text className="s-profile__stat-value">
                        {profileUserData.stats.likes}
                      </Text>
                      <Text className="s-profile__stat-label">获赞数</Text>
                    </View>
                    <View className="s-profile__stat">
                      <Text className="s-profile__stat-value">
                        {profileUserData.stats.posts}
                      </Text>
                      <Text className="s-profile__stat-label">我的帖子</Text>
                    </View>
                  </View>
                </View>
              )}

              {showBenefitsBlock ? (
                <View className="s-profile-benefits">
                  <ProfileBenefitsPurchaseBanner
                    onOpenPurchase={() => openPackageSheet()}
                  />

                  {showPaidBenefitsSection ? (
                    <ProfilePaidBenefitsSection
                      cards={recentPaidBenefitCards}
                      totalCount={totalPaidCardCount}
                      onViewAll={() => go(ROUTES.PROFILE_BENEFITS)}
                      loading={benefitsLoading}
                      onUpgrade={handleBenefitUpgrade}
                      onUsageHistory={handleUsageHistory}
                    />
                  ) : null}

                  {showFreeBenefitsSection && freeBenefitCard ? (
                    <ProfileFreeBenefitsSection
                      card={freeBenefitCard}
                      onOpenPurchase={() => openPackageSheet()}
                    />
                  ) : showBenefitsLoading ? (
                    <ProfileFreeBenefitsSection
                      card={buildFreeBenefitCardModel(null)}
                      loading
                      onOpenPurchase={() => openPackageSheet()}
                    />
                  ) : null}
                </View>
              ) : null}

              {debugEntitlementsEnabled ? (
                <View className="s-profile__debug-block">
                  <View
                    className="s-profile__debug-entitlements"
                    hoverClass="s-profile__debug-entitlements--pressed"
                    onClick={handleDebugEntitlements}
                  >
                    <Text className="s-profile__debug-entitlements-label">
                      调试权益 ·{' '}
                      {PROFILE_DEBUG_ENTITLEMENT_LABELS[debugEntitlementPreset] ??
                        PROFILE_DEBUG_ENTITLEMENT_LABELS.api}
                    </Text>
                  </View>
                  <View className="s-profile__debug-modals">
                    <View
                      className="s-profile__debug-modal-btn"
                      hoverClass="s-profile__debug-modal-btn--pressed"
                      onClick={() => setDebugContactUnlockExhaustedOpen(true)}
                    >
                      <Text className="s-profile__debug-modal-btn-label">
                        预览 · 联系方式解锁用尽
                      </Text>
                    </View>
                    <View
                      className="s-profile__debug-modal-btn"
                      hoverClass="s-profile__debug-modal-btn--pressed"
                      onClick={() => setDebugAiMatchExhaustedOpen(true)}
                    >
                      <Text className="s-profile__debug-modal-btn-label">
                        预览 · AI 匹配次数用尽
                      </Text>
                    </View>
                  </View>
                </View>
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

              <View className="s-profile__settings-card">
                <View
                  className="s-profile__settings-row"
                  hoverClass="s-profile__settings-row--pressed"
                  onClick={() => openSettings('notifications')}
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
                  onClick={() => openSettings('privacy')}
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
                  onClick={() => openSettings('help')}
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
                  onClick={handleLogout}
                >
                  <View className="s-profile__settings-icon s-profile__settings-icon--logout">
                    <LogOut size={18} />
                  </View>
                  <Text className="s-profile__settings-label s-profile__settings-label--logout">
                    退出登录
                  </Text>
                </View>
              </View>

              <View className="s-profile__scroll-spacer s-tabbar-offset" />
            </View>
          </ProfileTabErrorBoundary>
        </ScrollView>
      </View>

      {confirmDialog}
      {debugEntitlementsEnabled ? (
        <>
          <ContactUnlockQuotaExhaustedModal
            open={debugContactUnlockExhaustedOpen}
            onClose={() => setDebugContactUnlockExhaustedOpen(false)}
            onUpgrade={(tierId) => {
              setDebugContactUnlockExhaustedOpen(false);
              openPackageSheet({ initialSelectedTierId: tierId });
            }}
            currentPaidTierId={debugContactUnlockPreview.currentPaidTierId}
            freeMonthly={debugContactUnlockPreview.freeMonthly}
          />
          <AiPackageUpgradeSheet
            open={debugAiMatchExhaustedOpen}
            onClose={() => setDebugAiMatchExhaustedOpen(false)}
            activityLegacyId={PROFILE_SEED_ACTIVITY_LEGACY_ID}
            onViewAllBenefits={() => {
              setDebugAiMatchExhaustedOpen(false);
              go(ROUTES.PROFILE_BENEFITS);
            }}
          />
        </>
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
