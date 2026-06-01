import { useMemo } from 'react';
import Taro from '@tarojs/taro';
import type { EventPackageEntitlement, ProfileSummary } from '../../types/backend';
import {
  asEntitlementList,
  buildFreeBenefitCardModel,
  isValidFreeMonthlyQuota,
  pickGlobalFreeMonthly,
  type ProfileEventBenefitCardModel,
} from './profileBenefitsMapper';
import {
  resolveProfileDebugEntitlements,
  type ProfileDebugEntitlementPreset,
} from './profileDebugEntitlements';
import type { ProfileBenefitsBlockProps } from './ProfileBenefitsBlock';
import { go, ROUTES } from '../../utils/route';

export type UseProfileBenefitsSectionOptions = {
  apiEnabled: boolean;
  debugEntitlementsEnabled: boolean;
  debugPreset: ProfileDebugEntitlementPreset;
  benefitsLoading: boolean;
  paidEntitlements: EventPackageEntitlement[];
  recentPaidBenefitCards: ProfileEventBenefitCardModel[];
  totalPaidCardCount: number;
  summaryData: ProfileSummary | undefined;
  entitlementsData: unknown;
  onOpenPackageSheet: () => void;
  onUpgrade: (card: ProfileEventBenefitCardModel) => void;
};

export function useProfileBenefitsSection({
  apiEnabled,
  debugEntitlementsEnabled,
  debugPreset,
  benefitsLoading,
  paidEntitlements,
  recentPaidBenefitCards,
  totalPaidCardCount,
  summaryData,
  entitlementsData,
  onOpenPackageSheet,
  onUpgrade,
}: UseProfileBenefitsSectionOptions): ProfileBenefitsBlockProps {
  const debugEntitlementOverride = useMemo(
    () =>
      debugEntitlementsEnabled ? resolveProfileDebugEntitlements(debugPreset) : null,
    [debugPreset, debugEntitlementsEnabled],
  );

  const entitlementList = useMemo(
    () => asEntitlementList(entitlementsData),
    [entitlementsData],
  );

  const summaryFreeMonthly = useMemo(() => {
    const scoped = summaryData?.packageEntitlement?.freeMonthly;
    if (isValidFreeMonthlyQuota(scoped)) {
      return scoped;
    }
    for (const item of asEntitlementList(summaryData?.packageEntitlements)) {
      if (isValidFreeMonthlyQuota(item.freeMonthly)) {
        return item.freeMonthly;
      }
    }
    return undefined;
  }, [summaryData]);

  const globalFreeMonthly = useMemo(() => {
    if (debugEntitlementOverride) {
      return debugEntitlementOverride.freeMonthly;
    }
    return pickGlobalFreeMonthly(entitlementList, summaryFreeMonthly);
  }, [debugEntitlementOverride, entitlementList, summaryFreeMonthly]);

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

  const handleUsageHistory = () => {
    void Taro.showToast({ title: '使用记录敬请期待', icon: 'none' });
  };

  return {
    visible: showBenefitsBlock,
    showPaid: showPaidBenefitsSection,
    showFree: showFreeBenefitsSection,
    showFreeLoading: showBenefitsLoading,
    paidCards: recentPaidBenefitCards,
    totalPaidCount: totalPaidCardCount,
    benefitsLoading,
    freeCard: freeBenefitCard,
    onOpenPurchase: onOpenPackageSheet,
    onViewAllBenefits: () => go(ROUTES.PROFILE_BENEFITS),
    onUpgrade,
    onUsageHistory: handleUsageHistory,
  };
}
