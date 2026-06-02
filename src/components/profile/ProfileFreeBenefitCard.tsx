import './ProfileFreeBenefitCard.scss';
import React from 'react';
import { ChevronRight, Crown, Lock, Sparkles, Ticket } from '../../components/icons';
import type { ProfileFreeBenefitCardModel } from './profileBenefitsMapper';
import { Text, View } from '@tarojs/components';

export type ProfileFreeBenefitCardProps = {
  card: ProfileFreeBenefitCardModel;
  onOpenUpgrade?: () => void;
};

function QuotaFraction({
  remaining,
  limit,
  accentClass,
}: {
  remaining: number;
  limit: number;
  accentClass: string;
}) {
  return (
    <View className="s-profile-free-benefit__quota">
      <Text className={`s-profile-free-benefit__quota-remaining ${accentClass}`}>
        {remaining}
      </Text>
      <Text className="s-profile-free-benefit__quota-rest"> / {limit} 次</Text>
    </View>
  );
}

const ProfileFreeBenefitCard: React.FC<ProfileFreeBenefitCardProps> = ({
  card,
  onOpenUpgrade,
}) => (
  <View className="s-profile-free-benefit">
    <View className="s-profile-free-benefit__inner">
      <View className="s-profile-free-benefit__header">
        <View className="s-profile-free-benefit__header-left">
          <Ticket
            size={16}
            color="#c7c7cc"
            className="s-profile-free-benefit__ticket-icon"
            aria-hidden
          />
          <Text className="s-profile-free-benefit__title">{card.title}</Text>
          <View className="s-profile-free-benefit__tier-pill">
            <Text className="s-profile-free-benefit__tier-pill-text">免费版</Text>
          </View>
        </View>
        <View
          className="s-profile-free-benefit__upgrade-btn"
          hoverClass="s-profile-free-benefit__upgrade-btn--pressed"
          onClick={onOpenUpgrade}
        >
          <Text className="s-profile-free-benefit__upgrade-btn-text">升级解锁</Text>
          <ChevronRight
            size={14}
            color="var(--primary)"
            className="s-profile-free-benefit__upgrade-btn-icon"
            aria-hidden
          />
        </View>
      </View>

      <View className="s-profile-free-benefit__row">
        <View className="s-profile-free-benefit__row-top">
          <View className="s-profile-free-benefit__row-label-wrap">
            <Sparkles
              size={14}
              color="var(--primary)"
              className="s-profile-free-benefit__row-icon"
              aria-hidden
            />
            <Text className="s-profile-free-benefit__row-label">AI 智能匹配</Text>
          </View>
          <QuotaFraction
            remaining={card.aiMatch.remaining}
            limit={card.aiMatch.limit}
            accentClass="s-profile-free-benefit__quota-remaining--pink"
          />
        </View>
        <View className="s-profile-free-benefit__bar" aria-hidden>
          <View
            className="s-profile-free-benefit__bar-fill s-profile-free-benefit__bar-fill--pink"
            style={{ width: `${Math.round(card.aiMatch.remainingRatio * 100)}%` }}
          />
        </View>
        <Text className="s-profile-free-benefit__row-hint">{card.subtitle}</Text>
      </View>

      <View className="s-profile-free-benefit__row">
        <View className="s-profile-free-benefit__row-top">
          <View className="s-profile-free-benefit__row-label-wrap">
            <Lock
              size={14}
              color="#d4a017"
              className="s-profile-free-benefit__row-icon"
              aria-hidden
            />
            <Text className="s-profile-free-benefit__row-label">联系方式解锁</Text>
          </View>
          <QuotaFraction
            remaining={card.contactUnlock.remaining}
            limit={card.contactUnlock.limit}
            accentClass="s-profile-free-benefit__quota-remaining--purple"
          />
        </View>
        <View className="s-profile-free-benefit__bar" aria-hidden>
          <View
            className="s-profile-free-benefit__bar-fill s-profile-free-benefit__bar-fill--purple"
            style={{ width: `${Math.round(card.contactUnlock.remainingRatio * 100)}%` }}
          />
        </View>
        <Text className="s-profile-free-benefit__row-hint">{card.subtitle}</Text>
      </View>

      <View
        className="s-profile-free-benefit__footer"
        hoverClass="s-profile-free-benefit__footer--pressed"
        onClick={onOpenUpgrade}
      >
        <Crown
          size={14}
          color="var(--primary)"
          className="s-profile-free-benefit__footer-crown"
          aria-hidden
        />
        <Text className="s-profile-free-benefit__footer-text">{card.upsellText}</Text>
        <ChevronRight size={16} color="var(--primary)" aria-hidden />
      </View>
    </View>
  </View>
);

export default ProfileFreeBenefitCard;
