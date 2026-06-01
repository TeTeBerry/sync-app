import React from 'react';
import AiPackageUpgradeSheet from '../ai-chat/AiPackageUpgradeSheet';
import { ContactUnlockQuotaExhaustedModal } from '../contact-unlock/ContactUnlockQuotaExhaustedModal';
import type {
  FreeMonthlyQuota,
  PackageTierId,
  ProfileActivityItem,
} from '../../types/backend';
import ProfilePackageSheet from './ProfilePackageSheet';

export type ProfileOverlaysHostProps = {
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
    preview: {
      currentPaidTierId: PackageTierId | null;
      freeMonthly: FreeMonthlyQuota;
    };
    activityLegacyId: number;
    onCloseContactUnlock: () => void;
    onCloseAiMatch: () => void;
    onUpgradeContactUnlock: (tierId: PackageTierId) => void;
    onViewAllBenefits: () => void;
  };
};

const ProfileOverlaysHost: React.FC<ProfileOverlaysHostProps> = ({
  packageSheetOpen,
  packageSheet,
  debug,
}) => (
  <>
    {debug.enabled ? (
      <>
        <ContactUnlockQuotaExhaustedModal
          open={debug.contactUnlockOpen}
          onClose={debug.onCloseContactUnlock}
          onUpgrade={debug.onUpgradeContactUnlock}
          currentPaidTierId={debug.preview.currentPaidTierId}
          freeMonthly={debug.preview.freeMonthly}
        />
        <AiPackageUpgradeSheet
          open={debug.aiMatchOpen}
          onClose={debug.onCloseAiMatch}
          activityLegacyId={debug.activityLegacyId}
          onViewAllBenefits={debug.onViewAllBenefits}
        />
      </>
    ) : null}
    {packageSheetOpen ? (
      <ProfilePackageSheet
        open
        activityLegacyId={packageSheet.activityLegacyId}
        initialSelectedTierId={packageSheet.initialSelectedTierId}
        currentPaidTierId={packageSheet.currentPaidTierId}
        activities={packageSheet.activities}
        activitiesLoading={packageSheet.activitiesLoading}
        paidTierByActivityLegacyId={packageSheet.paidTierByActivityLegacyId}
        onClose={packageSheet.onClose}
        onPurchaseSuccess={packageSheet.onPurchaseSuccess}
      />
    ) : null}
  </>
);

export default ProfileOverlaysHost;
