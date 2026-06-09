import '../../../components/profile/profile.scss';
import Taro, { useDidShow } from '@tarojs/taro';
import React, { useCallback, useMemo, useState } from 'react';
import PageNavigation from '../../../components/navigation/PageNavigation';
import {
  getNextTierId,
  ProfilePackageSheet,
  ProfilePaidBenefitsSection,
  useProfilePaidBenefitCards,
  type PackageTierId,
  type ProfileEventBenefitCardModel,
} from '../../../components/profile';
import { isLiveApi } from '../../../constants/api';
import { isProfileBenefitsEnabled } from '../../../constants/featureFlags';
import { useProfileActivitiesQuery } from '../../../hooks/useSyncApi';
import { useStackPageMainHeight } from '../../../hooks/useTabPageMainHeight';
import { go, ROUTES } from '../../../utils/route';
import { useEndRouteTransitionOnShow } from '../../../hooks/useEndRouteTransitionOnShow';
import { invalidateProfilePackageState } from '../../../utils/queryInvalidation';
import type { ProfileActivityItem } from '../../../types/backend';
import { ScrollView, View } from '@tarojs/components';

const ProfileBenefitsPage: React.FC = () => {
  useEndRouteTransitionOnShow();
  const benefitsEnabled = isProfileBenefitsEnabled();
  const mainScrollHeight = useStackPageMainHeight();
  const apiEnabled = isLiveApi();
  const activitiesQuery = useProfileActivitiesQuery();
  const { benefitsLoading, paidBenefitCards, paidEntitlements } =
    useProfilePaidBenefitCards();

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

  const profileActivitiesList = useMemo(
    (): ProfileActivityItem[] => activitiesQuery.data ?? [],
    [activitiesQuery.data],
  );

  const paidTierByActivityLegacyId = useMemo(() => {
    const map = new Map<number, PackageTierId>();
    for (const entitlement of paidEntitlements) {
      if (entitlement.paidTierId) {
        map.set(entitlement.activityLegacyId, entitlement.paidTierId);
      }
    }
    return map;
  }, [paidEntitlements]);

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

  const handleUsageHistory = useCallback(() => {
    void Taro.showToast({ title: '使用记录敬请期待', icon: 'none' });
  }, []);

  useDidShow(() => {
    if (!isProfileBenefitsEnabled()) {
      go(ROUTES.PROFILE);
      return;
    }
    if (apiEnabled) {
      void invalidateProfilePackageState();
    }
  });

  if (!benefitsEnabled) {
    return null;
  }

  return (
    <View data-cmp="ProfileBenefitsPage" className="s-profile-stack">
      <PageNavigation title="我的权益" fallback={ROUTES.PROFILE} tone="surface" />

      <ScrollView
        scrollY
        enhanced
        showScrollbar={false}
        className="s-profile-stack__scroll s-scrollbar-none"
        style={
          mainScrollHeight != null ? { height: `${mainScrollHeight}px` } : undefined
        }
      >
        <View className="s-profile-stack__inner">
          <ProfilePaidBenefitsSection
            cards={paidBenefitCards}
            loading={benefitsLoading}
            showSectionHead={false}
            onUpgrade={handleBenefitUpgrade}
            onUsageHistory={handleUsageHistory}
          />
        </View>
      </ScrollView>

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

export default ProfileBenefitsPage;
