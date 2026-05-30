import "./ProfilePaidBenefitsSection.scss";
import React from "react";
import { Zap } from "lucide-react-taro";
import type { ProfileEventBenefitCardModel } from "../profileBenefitsMapper";
import ProfileEventBenefitCard from "./ProfileEventBenefitCard";
import ThemedPageLoader from "../../../components/ThemedPageLoader";
import { Text, View } from "@tarojs/components";

export type ProfilePaidBenefitsSectionProps = {
  cards: ProfileEventBenefitCardModel[];
  loading?: boolean;
  onUpgrade?: (card: ProfileEventBenefitCardModel) => void;
  onUsageHistory?: () => void;
};

const ProfilePaidBenefitsSection: React.FC<ProfilePaidBenefitsSectionProps> = ({
  cards,
  loading = false,
  onUpgrade,
  onUsageHistory,
}) => (
  <View className="s-profile-paid-benefits">
    <View className="s-profile-paid-benefits__section-head">
      <View className="s-profile-paid-benefits__section-title-wrap">
        <Zap size={16} color="#ffd60a" className="s-profile-paid-benefits__section-zap" aria-hidden />
        <Text className="s-profile-paid-benefits__section-title">我的权益</Text>
      </View>
      <Text className="s-profile-paid-benefits__section-count">共 {cards.length} 张</Text>
    </View>

    {loading ? (
      <View className="s-profile-paid-benefits__loading">
        <ThemedPageLoader variant="inline" label="加载权益…" minHeight={120} />
      </View>
    ) : (
      <View className="s-profile-paid-benefits__cards">
        {cards.map((card) => (
          <ProfileEventBenefitCard
            key={card.activityLegacyId}
            card={card}
            onUpgrade={onUpgrade}
            onUsageHistory={onUsageHistory}
          />
        ))}
      </View>
    )}
  </View>
);

export default ProfilePaidBenefitsSection;
