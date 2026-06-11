import React from 'react';
import type { PackageTierId, ProfileActivityItem } from '../../types/backend';
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
};

const ProfileOverlaysHost: React.FC<ProfileOverlaysHostProps> = ({
  packageSheetOpen,
  packageSheet,
}) => {
  if (!packageSheetOpen) {
    return null;
  }

  return (
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
  );
};

export default ProfileOverlaysHost;
