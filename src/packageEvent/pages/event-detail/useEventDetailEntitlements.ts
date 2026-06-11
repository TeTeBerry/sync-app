import { useCallback, useMemo, useState } from 'react';
import { pickGlobalFreeMonthly } from '../../../components/profile';
import type { QueryEnableOptions } from '../../../hooks/sync/types';
import { useProfileEntitlementsQuery } from '../../../hooks/useSyncApi';
import type { PackageTierId } from '../../../types/backend';
import { resolveProfileEntitlement } from '../../../utils/profileEntitlement';

export function useEventDetailEntitlements(
  eventId: number,
  options?: QueryEnableOptions,
) {
  const entitlementsQuery = useProfileEntitlementsQuery(eventId, options);
  const profileEntitlement = useMemo(
    () => resolveProfileEntitlement(entitlementsQuery.data, eventId),
    [entitlementsQuery.data, eventId],
  );
  const currentPaidTierId = profileEntitlement?.paidTierId ?? null;
  const freeMonthly = useMemo(
    () => pickGlobalFreeMonthly(entitlementsQuery.data),
    [entitlementsQuery.data],
  );

  const [contactUnlockExhaustedOpen, setContactUnlockExhaustedOpen] = useState(false);
  const [packageSheetOpen, setPackageSheetOpen] = useState(false);
  const [packageSheetInitialTierId, setPackageSheetInitialTierId] = useState<
    PackageTierId | undefined
  >(undefined);

  const openContactUnlockExhaustedModal = useCallback(() => {
    setContactUnlockExhaustedOpen(true);
  }, []);

  const closeContactUnlockExhaustedModal = useCallback(() => {
    setContactUnlockExhaustedOpen(false);
  }, []);

  const openPackageUpgradeSheet = useCallback((targetTierId: PackageTierId) => {
    setContactUnlockExhaustedOpen(false);
    setPackageSheetInitialTierId(targetTierId);
    setPackageSheetOpen(true);
  }, []);

  const closePackageUpgradeSheet = useCallback(() => {
    setPackageSheetOpen(false);
    setPackageSheetInitialTierId(undefined);
  }, []);

  const entitlements = {
    eventId,
    contactUnlockExhaustedOpen,
    closeContactUnlockExhaustedModal,
    openPackageUpgradeSheet,
    currentPaidTierId,
    freeMonthly,
    packageSheetOpen,
    packageSheetInitialTierId,
    closePackageUpgradeSheet,
  };

  return { entitlements, openContactUnlockExhaustedModal };
}
