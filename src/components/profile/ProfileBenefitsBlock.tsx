import React from 'react';
import ProfileBenefitsPurchaseBanner from './ProfileBenefitsPurchaseBanner';
import ProfileFreeBenefitsSection from './ProfileFreeBenefitsSection';
import ProfilePaidBenefitsSection from './ProfilePaidBenefitsSection';
import { buildFreeBenefitCardModel } from './profileBenefitsMapper';
import type {
  ProfileEventBenefitCardModel,
  ProfileFreeBenefitCardModel,
} from './profileBenefitsMapper';
import { View } from '@tarojs/components';

export type ProfileBenefitsBlockProps = {
  visible: boolean;
  showPaid: boolean;
  showFree: boolean;
  showFreeLoading: boolean;
  paidCards: ProfileEventBenefitCardModel[];
  totalPaidCount: number;
  benefitsLoading: boolean;
  freeCard: ProfileFreeBenefitCardModel | null;
  onOpenPurchase: () => void;
  onViewAllBenefits: () => void;
  onUpgrade: (card: ProfileEventBenefitCardModel) => void;
  onUsageHistory: () => void;
};

const ProfileBenefitsBlock: React.FC<ProfileBenefitsBlockProps> = ({
  visible,
  showPaid,
  showFree,
  showFreeLoading,
  paidCards,
  totalPaidCount,
  benefitsLoading,
  freeCard,
  onOpenPurchase,
  onViewAllBenefits,
  onUpgrade,
  onUsageHistory,
}) => {
  if (!visible) {
    return null;
  }

  return (
    <View className="s-profile-benefits">
      <ProfileBenefitsPurchaseBanner onOpenPurchase={onOpenPurchase} />

      {showPaid ? (
        <ProfilePaidBenefitsSection
          cards={paidCards}
          totalCount={totalPaidCount}
          onViewAll={onViewAllBenefits}
          loading={benefitsLoading}
          onUpgrade={onUpgrade}
          onUsageHistory={onUsageHistory}
        />
      ) : null}

      {showFree && freeCard ? (
        <ProfileFreeBenefitsSection card={freeCard} onOpenPurchase={onOpenPurchase} />
      ) : showFreeLoading ? (
        <ProfileFreeBenefitsSection
          card={buildFreeBenefitCardModel(null)}
          loading
          onOpenPurchase={onOpenPurchase}
        />
      ) : null}
    </View>
  );
};

export default ProfileBenefitsBlock;
