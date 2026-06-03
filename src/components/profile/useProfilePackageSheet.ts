import { useCallback, useEffect, useMemo, useState } from 'react';
import { isLiveApi } from '../../constants/api';
import { useProfileActivitiesQuery } from '../../hooks/useSyncApi';
import { selectConsumeProfileIntent, useNavigationStore } from '../../stores';
import { invalidateProfilePackageState } from '../../utils/queryInvalidation';
import type { PackageTierId } from './profilePackageData';
import {
  getNextTierId,
  type ProfileEventBenefitCardModel,
} from './profileBenefitsMapper';
import type { EventPackageEntitlement } from '../../types/backend';

export type UseProfilePackageSheetOptions = {
  paidEntitlements: EventPackageEntitlement[];
};

export function useProfilePackageSheet({
  paidEntitlements,
}: UseProfilePackageSheetOptions) {
  const consumeProfileIntent = useNavigationStore(selectConsumeProfileIntent);
  const apiEnabled = isLiveApi();

  const [packageSheetOpen, setPackageSheetOpen] = useState(false);
  const activitiesQuery = useProfileActivitiesQuery({
    enabled: packageSheetOpen,
  });
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
    () => activitiesQuery.data ?? [],
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

  const applyRouteParams = useCallback(() => {
    const intent = consumeProfileIntent();
    if (intent?.openPackageSheet) {
      openPackageSheet();
    }
  }, [consumeProfileIntent, openPackageSheet]);

  useEffect(() => {
    applyRouteParams();
  }, [applyRouteParams]);

  return {
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
    openPackageSheet,
    closePackageSheet,
    handleBenefitUpgrade,
    applyRouteParams,
  };
}
