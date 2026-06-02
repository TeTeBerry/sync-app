import { useMemo } from 'react';
import { isApiEnabled } from '../../constants/api';
import {
  useProfileActivitiesQuery,
  useProfileEntitlementsQuery,
  useProfileSummaryQuery,
} from '../../hooks/useSyncApi';
import type { ProfileActivityItem } from '../../types/backend';
import { profileActivities } from './mockData';
import {
  asEntitlementList,
  buildMockPaidEntitlement,
  buildMockProPlusEntitlement,
  listPaidEntitlements,
} from './profileBenefitsMapper';
import {
  buildActivityByLegacyIdMap,
  buildPaidBenefitCards,
  pickRecentActivityBenefitCards,
} from './profileBenefitCards';
import {
  isProfileDebugEntitlementsEnabled,
  readProfileDebugEntitlementPreset,
  resolveProfileDebugEntitlements,
  type ProfileDebugEntitlementPreset,
} from './profileDebugEntitlements';

export function useProfilePaidBenefitCards(options?: {
  useDebugEntitlements?: boolean;
  debugPreset?: ProfileDebugEntitlementPreset;
  /** When false, skips entitlements + activities fetch (profile tab defers below fold). */
  entitlementsEnabled?: boolean;
}) {
  const apiEnabled = isApiEnabled();
  const entitlementsEnabled = options?.entitlementsEnabled ?? true;
  const summaryQuery = useProfileSummaryQuery();
  const allEntitlementsQuery = useProfileEntitlementsQuery(undefined, {
    enabled: entitlementsEnabled,
  });
  const activitiesQuery = useProfileActivitiesQuery({
    enabled: entitlementsEnabled,
  });

  const debugEnabled =
    options?.useDebugEntitlements ?? isProfileDebugEntitlementsEnabled();
  const debugPreset = options?.debugPreset ?? readProfileDebugEntitlementPreset();
  const debugEntitlementOverride = useMemo(
    () => (debugEnabled ? resolveProfileDebugEntitlements(debugPreset) : null),
    [debugEnabled, debugPreset],
  );

  const entitlementList = useMemo(
    () => asEntitlementList(allEntitlementsQuery.data),
    [allEntitlementsQuery.data],
  );

  const benefitsLoading =
    apiEnabled &&
    !debugEntitlementOverride &&
    (allEntitlementsQuery.isLoading || summaryQuery.isLoading) &&
    allEntitlementsQuery.data == null;

  const paidEntitlements = useMemo(() => {
    if (debugEntitlementOverride) {
      return debugEntitlementOverride.paid;
    }
    if (!apiEnabled) {
      return [buildMockPaidEntitlement(), buildMockProPlusEntitlement()];
    }
    return listPaidEntitlements(
      entitlementList,
      summaryQuery.data?.packageEntitlements,
    );
  }, [
    apiEnabled,
    debugEntitlementOverride,
    entitlementList,
    summaryQuery.data?.packageEntitlements,
  ]);

  const activityByLegacyId = useMemo(() => {
    const items: ProfileActivityItem[] =
      apiEnabled && activitiesQuery.data?.length
        ? activitiesQuery.data
        : profileActivities;
    return buildActivityByLegacyIdMap(items);
  }, [activitiesQuery.data, apiEnabled]);

  const paidBenefitCards = useMemo(
    () => buildPaidBenefitCards(paidEntitlements, activityByLegacyId),
    [activityByLegacyId, paidEntitlements],
  );

  const recentPaidBenefitCards = useMemo(
    () => pickRecentActivityBenefitCards(paidBenefitCards, activityByLegacyId),
    [activityByLegacyId, paidBenefitCards],
  );

  return {
    apiEnabled,
    benefitsLoading,
    paidBenefitCards,
    recentPaidBenefitCards,
    paidEntitlements,
    entitlementsData: allEntitlementsQuery.data,
    activityByLegacyId,
    totalPaidCardCount: paidBenefitCards.length,
    refetchEntitlements: allEntitlementsQuery.refetch,
  };
}
