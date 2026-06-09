import { useMemo } from 'react';
import { isLiveApi } from '../../constants/api';
import {
  useProfileActivitiesQuery,
  useProfileEntitlementsQuery,
  useProfileSummaryQuery,
} from '../../hooks/useSyncApi';
import { asEntitlementList, listPaidEntitlements } from './profileBenefitsMapper';
import {
  buildActivityByLegacyIdMap,
  buildPaidBenefitCards,
  pickRecentActivityBenefitCards,
} from './profileBenefitCards';

export function useProfilePaidBenefitCards(options?: {
  /** When false, skips entitlements + activities fetch (profile tab defers below fold). */
  entitlementsEnabled?: boolean;
}) {
  const apiEnabled = isLiveApi();
  const entitlementsEnabled = options?.entitlementsEnabled ?? true;
  const summaryQuery = useProfileSummaryQuery();
  const allEntitlementsQuery = useProfileEntitlementsQuery(undefined, {
    enabled: entitlementsEnabled,
  });
  const activitiesQuery = useProfileActivitiesQuery({
    enabled: entitlementsEnabled,
  });

  const entitlementList = useMemo(
    () => asEntitlementList(allEntitlementsQuery.data),
    [allEntitlementsQuery.data],
  );

  const benefitsLoading =
    apiEnabled &&
    (allEntitlementsQuery.isLoading || summaryQuery.isLoading) &&
    allEntitlementsQuery.data == null;

  const paidEntitlements = useMemo(
    () => listPaidEntitlements(entitlementList, summaryQuery.data?.packageEntitlements),
    [entitlementList, summaryQuery.data?.packageEntitlements],
  );

  const activityByLegacyId = useMemo(() => {
    return buildActivityByLegacyIdMap(activitiesQuery.data ?? []);
  }, [activitiesQuery.data]);

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
