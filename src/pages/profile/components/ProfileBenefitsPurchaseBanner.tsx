import "./ProfileBenefitsPurchaseBanner.scss";
import React from "react";
import { ChevronRight, Crown } from "lucide-react-taro";
import { Text, View } from "@tarojs/components";

export type ProfileBenefitsPurchaseBannerProps = {
  onOpenPurchase: () => void;
};

const ProfileBenefitsPurchaseBanner: React.FC<ProfileBenefitsPurchaseBannerProps> = ({
  onOpenPurchase,
}) => (
  <View
    className="s-profile-benefits-banner"
    hoverClass="s-profile-benefits-banner--pressed"
    onClick={onOpenPurchase}>
    <View className="s-profile-benefits-banner__icon-wrap" aria-hidden>
      <Crown size={18} color="#d4a017" aria-hidden />
    </View>
    <View className="s-profile-benefits-banner__copy">
      <Text className="s-profile-benefits-banner__title">购买套餐</Text>
      <Text className="s-profile-benefits-banner__subtitle">
        Pro · Pro+ · Ultra — 单场专属权益
      </Text>
    </View>
    <View className="s-profile-benefits-banner__cta">
      <Text className="s-profile-benefits-banner__cta-text">立即开通</Text>
      <ChevronRight size={16} color="#d4a017" aria-hidden />
    </View>
  </View>
);

export default ProfileBenefitsPurchaseBanner;
