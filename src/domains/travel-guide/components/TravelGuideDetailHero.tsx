import type { ActivityMapRegion } from '@/constants/activityMapRegion';
import { shouldShowTravelGuideSelfDriveOption } from '@/constants/activityMapRegion';
import type { TravelGuidePlan } from '@/types/travelGuide';
import {
  findTravelGuideTotalBudgetItem,
  shortTravelGuideBudgetLabel,
  travelGuideBudgetBannerTitle,
  travelGuideBudgetPerPersonRange,
} from '@/domains/travel-guide/utils/travelGuideBudgetDisplay.util';
import { getTravelGuideTitle } from '@/constants/aiCtaLabels';
import { Map } from '@/components/icons';
import { Text, View } from '@tarojs/components';
import { useT } from '@/hooks/useI18n';

type TravelGuideDetailHeroProps = {
  plan: TravelGuidePlan;
  activityRegion?: ActivityMapRegion | null;
};

export function TravelGuideDetailHero({
  plan,
  activityRegion,
}: TravelGuideDetailHeroProps) {
  useT();
  const t = useT();
  const totalBudget = findTravelGuideTotalBudgetItem(plan);
  const perPerson = totalBudget
    ? travelGuideBudgetPerPersonRange(totalBudget.range, plan.headcount)
    : null;

  const showSelfDriveChip = shouldShowTravelGuideSelfDriveOption(activityRegion);

  const chips = [
    plan.departure ? `${plan.departure}${t('travelPlan.departureLabel')}` : null,
    plan.headcount > 0 ? `${plan.headcount}${t('travelPlan.headcountUnit')}` : null,
    plan.accommodationNights > 0
      ? `${t('travelPlan.nightsLabel', { count: plan.accommodationNights })}`
      : null,
    plan.accommodationNights > 0 && plan.budgetLabel
      ? shortTravelGuideBudgetLabel(plan.budgetLabel)
      : null,
    showSelfDriveChip
      ? plan.selfDrive
        ? t('travelPlan.driveYes')
        : t('travelPlan.driveNo')
      : null,
  ].filter(Boolean) as string[];

  return (
    <View className="s-travel-guide-detail__hero">
      <View className="s-travel-guide-detail__hero-top">
        <View className="s-travel-guide-detail__hero-badge" aria-hidden>
          <Map size={16} color="#ff69b4" />
        </View>
        <Text className="s-travel-guide-detail__hero-kicker">
          {getTravelGuideTitle()}
        </Text>
      </View>
      <Text className="s-travel-guide-detail__hero-title">{plan.activityName}</Text>
      <Text className="s-travel-guide-detail__hero-meta">
        {[plan.eventDates, plan.venue].filter(Boolean).join(' · ')}
      </Text>
      {chips.length > 0 ? (
        <View className="s-travel-guide-detail__chips">
          {chips.map((chip) => (
            <Text key={chip} className="s-travel-guide-detail__chip">
              {chip}
            </Text>
          ))}
        </View>
      ) : null}
      {totalBudget ? (
        <View className="s-travel-guide-detail__budget-banner">
          <Text className="s-travel-guide-detail__budget-label">
            {travelGuideBudgetBannerTitle(plan.headcount)}
          </Text>
          <Text className="s-travel-guide-detail__budget-value">
            {totalBudget.range}
          </Text>
          {perPerson ? (
            <Text className="s-travel-guide-detail__budget-sub">{perPerson}</Text>
          ) : null}
        </View>
      ) : null}
    </View>
  );
}
