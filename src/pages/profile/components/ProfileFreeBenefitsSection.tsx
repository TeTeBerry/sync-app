import './ProfileFreeBenefitsSection.scss';
import React from 'react';
import { Zap } from 'lucide-react-taro';
import type { ProfileFreeBenefitCardModel } from '../profileBenefitsMapper';
import ProfileFreeBenefitCard from './ProfileFreeBenefitCard';
import ThemedPageLoader from '../../../components/ThemedPageLoader';
import { Text, View } from '@tarojs/components';

export type ProfileFreeBenefitsSectionProps = {
  card: ProfileFreeBenefitCardModel;
  loading?: boolean;
  onOpenPurchase: () => void;
};

const ProfileFreeBenefitsSection: React.FC<ProfileFreeBenefitsSectionProps> = ({
  card,
  loading = false,
  onOpenPurchase,
}) => (
  <View className="s-profile-free-benefits">
    <View className="s-profile-free-benefits__section-head">
      <View className="s-profile-free-benefits__section-title-wrap">
        <Zap
          size={16}
          color="#ffcc00"
          className="s-profile-free-benefits__section-zap"
          aria-hidden
        />
        <Text className="s-profile-free-benefits__section-title">我的权益</Text>
      </View>
      <Text className="s-profile-free-benefits__section-badge">免费体验</Text>
    </View>

    {loading ? (
      <View className="s-profile-free-benefits__loading">
        <ThemedPageLoader variant="inline" label="加载权益…" minHeight={120} />
      </View>
    ) : (
      <ProfileFreeBenefitCard card={card} onOpenUpgrade={onOpenPurchase} />
    )}
  </View>
);

export default ProfileFreeBenefitsSection;
