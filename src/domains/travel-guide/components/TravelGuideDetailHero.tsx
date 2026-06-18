import { TRAVEL_GUIDE_TITLE } from '@/constants/aiCtaLabels';
import type { TravelGuidePlan } from '@/types/travelGuide';
import {
  findTravelGuideTotalBudgetItem,
  shortTravelGuideBudgetLabel,
  travelGuideBudgetPerPersonRange,
} from '@/domains/travel-guide/utils/travelGuideBudgetDisplay.util';
import { Sparkles } from '@/components/icons';
import { Text, View } from '@tarojs/components';

type TravelGuideDetailHeroProps = {
  plan: TravelGuidePlan;
};

export function TravelGuideDetailHero({ plan }: TravelGuideDetailHeroProps) {
  const totalBudget = findTravelGuideTotalBudgetItem(plan);
  const perPersonBudget =
    totalBudget != null
      ? travelGuideBudgetPerPersonRange(totalBudget.range, plan.headcount)
      : null;

  return (
    <View className="s-travel-guide-detail__hero">
      <View className="s-travel-guide-detail__hero-top">
        <View className="s-travel-guide-detail__hero-badge" aria-hidden>
          <Sparkles size={14} color="#ff69b4" />
        </View>
        <Text className="s-travel-guide-detail__hero-kicker">{TRAVEL_GUIDE_TITLE}</Text>
      </View>

      <Text className="s-travel-guide-detail__hero-title">{plan.activityName}</Text>

      <Text className="s-travel-guide-detail__hero-meta">
        {plan.eventDates} · {plan.venue}
      </Text>

      <View className="s-travel-guide-detail__chips">
        <Text className="s-travel-guide-detail__chip">{plan.departure}</Text>
        <Text className="s-travel-guide-detail__chip">{plan.headcount}人</Text>
        <Text className="s-travel-guide-detail__chip">
          住{plan.accommodationNights}晚
        </Text>
        <Text className="s-travel-guide-detail__chip">
          {shortTravelGuideBudgetLabel(plan.budgetLabel)}
        </Text>
        <Text className="s-travel-guide-detail__chip">
          {plan.selfDrive ? '自驾' : '公共交通'}
        </Text>
      </View>

      {totalBudget ? (
        <View className="s-travel-guide-detail__budget-banner">
          <Text className="s-travel-guide-detail__budget-label">全程预算 · 合计</Text>
          <Text className="s-travel-guide-detail__budget-value">
            {totalBudget.range}
          </Text>
          {perPersonBudget ? (
            <Text className="s-travel-guide-detail__budget-sub">
              人均 {perPersonBudget}
            </Text>
          ) : null}
        </View>
      ) : null}
    </View>
  );
}
