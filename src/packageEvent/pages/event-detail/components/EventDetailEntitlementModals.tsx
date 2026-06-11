import React from 'react';
import { ContactUnlockQuotaExhaustedModal } from '../../../../components/contact-unlock/ContactUnlockQuotaExhaustedModal';
import { ProfilePackageSheet } from '../../../../components/profile';
import { invalidateProfilePackageState } from '../../../../utils/queryInvalidation';
import type { FreeMonthlyQuota, PackageTierId } from '../../../../types/backend';

export type EventDetailEntitlementModalsProps = {
  eventId: number;
  contactUnlockExhaustedOpen: boolean;
  onCloseContactUnlockExhausted: () => void;
  onUpgradeFromContactUnlock: (targetTierId: PackageTierId) => void;
  currentPaidTierId: PackageTierId | null;
  freeMonthly: FreeMonthlyQuota | null | undefined;
  packageSheetOpen: boolean;
  packageSheetInitialTierId?: PackageTierId;
  onClosePackageSheet: () => void;
};

export const EventDetailEntitlementModals: React.FC<
  EventDetailEntitlementModalsProps
> = ({
  eventId,
  contactUnlockExhaustedOpen,
  onCloseContactUnlockExhausted,
  onUpgradeFromContactUnlock,
  currentPaidTierId,
  freeMonthly,
  packageSheetOpen,
  packageSheetInitialTierId,
  onClosePackageSheet,
}) => {
  return (
    <>
      <ContactUnlockQuotaExhaustedModal
        open={contactUnlockExhaustedOpen}
        onClose={onCloseContactUnlockExhausted}
        onUpgrade={onUpgradeFromContactUnlock}
        currentPaidTierId={currentPaidTierId}
        freeMonthly={freeMonthly}
      />
      {packageSheetOpen ? (
        <ProfilePackageSheet
          open
          activityLegacyId={eventId}
          initialSelectedTierId={packageSheetInitialTierId}
          currentPaidTierId={currentPaidTierId ?? undefined}
          onClose={onClosePackageSheet}
          onPurchaseSuccess={() => {
            void invalidateProfilePackageState();
          }}
        />
      ) : null}
    </>
  );
};
