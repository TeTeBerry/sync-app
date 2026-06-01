import React from 'react';
import AiPackageUpgradeSheet from '../ai-chat/AiPackageUpgradeSheet';
import { ContactUnlockQuotaExhaustedModal } from '../contact-unlock/ContactUnlockQuotaExhaustedModal';
import type { FreeMonthlyQuota, PackageTierId } from '../../types/backend';

export type ProfileDebugModalsHostProps = {
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

const ProfileDebugModalsHost: React.FC<ProfileDebugModalsHostProps> = ({
  contactUnlockOpen,
  aiMatchOpen,
  preview,
  activityLegacyId,
  onCloseContactUnlock,
  onCloseAiMatch,
  onUpgradeContactUnlock,
  onViewAllBenefits,
}) => (
  <>
    <ContactUnlockQuotaExhaustedModal
      open={contactUnlockOpen}
      onClose={onCloseContactUnlock}
      onUpgrade={onUpgradeContactUnlock}
      currentPaidTierId={preview.currentPaidTierId}
      freeMonthly={preview.freeMonthly}
    />
    <AiPackageUpgradeSheet
      open={aiMatchOpen}
      onClose={onCloseAiMatch}
      activityLegacyId={activityLegacyId}
      onViewAllBenefits={onViewAllBenefits}
    />
  </>
);

export default ProfileDebugModalsHost;
