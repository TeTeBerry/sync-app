import "./ProfilePaidBenefitsSection.scss";
import React from "react";
import { ChevronRight, Zap } from "lucide-react-taro";
import type { ProfileEventBenefitCardModel } from "../profileBenefitsMapper";
import ProfileEventBenefitCard from "./ProfileEventBenefitCard";
import ThemedPageLoader from "../../../components/ThemedPageLoader";
import { Text, View } from "@tarojs/components";

export type ProfilePaidBenefitsSectionProps = {
  cards: ProfileEventBenefitCardModel[];
  /** Total cards across all activities (preview tab may show fewer). */
  totalCount?: number;
  onViewAll?: () => void;
  showSectionHead?: boolean;
  loading?: boolean;
  onUpgrade?: (card: ProfileEventBenefitCardModel) => void;
  onUsageHistory?: () => void;
};

const ProfilePaidBenefitsSection: React.FC<ProfilePaidBenefitsSectionProps> = ({
  cards,
  totalCount,
  onViewAll,
  showSectionHead = true,
  loading = false,
  onUpgrade,
  onUsageHistory,
}) => {
  const allCount = totalCount ?? cards.length;
  const showViewAll = Boolean(onViewAll) && allCount > cards.length;

  return (
    <View className="s-profile-paid-benefits">
      {showSectionHead ? (
        <View className="s-profile-paid-benefits__section-head">
          <View className="s-profile-paid-benefits__section-title-wrap">
            <Zap
              size={16}
              color="#ffd60a"
              className="s-profile-paid-benefits__section-zap"
              aria-hidden
            />
            <Text className="s-profile-paid-benefits__section-title">我的权益</Text>
          </View>
          {showViewAll ? (
            <View
              className="s-profile-paid-benefits__view-all"
              hoverClass="s-profile-paid-benefits__view-all--pressed"
              onClick={onViewAll}
            >
              <Text className="s-profile-paid-benefits__view-all-text">查看全部权益</Text>
              <ChevronRight size={14} color="#8e8e93" aria-hidden />
            </View>
          ) : null}
        </View>
      ) : null}

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
};

export default ProfilePaidBenefitsSection;
