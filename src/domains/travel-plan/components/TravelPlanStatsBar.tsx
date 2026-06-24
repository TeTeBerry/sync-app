import { Button } from '@/components/ui';
import { useT } from '@/hooks/useI18n';
import { Text, View } from '@tarojs/components';
import {
  clampSplitCount,
  MAX_SPLIT_COUNT,
  MIN_SPLIT_COUNT,
} from '../utils/travelPlanSplit.util';
import { formatTravelPlanCost } from '../utils/travelPlanStats';
import type { TravelPlanStats } from '../types';

type TravelPlanStatsBarProps = {
  stats: TravelPlanStats;
  copyingSplitSummary?: boolean;
  onSplitCountChange: (count: number) => void;
  onCopySplitSummary: () => void;
};

function InlineStepper({
  value,
  min,
  max,
  onChange,
  ariaDecrease,
  ariaIncrease,
}: {
  value: number;
  min: number;
  max: number;
  onChange: (next: number) => void;
  ariaDecrease: string;
  ariaIncrease: string;
}) {
  return (
    <View className="s-travel-plan__stats-stepper">
      <Button
        className="s-travel-plan__stats-stepper-btn"
        disabled={value <= min}
        hoverClass="s-travel-plan__stats-stepper-btn--pressed"
        aria-label={ariaDecrease}
        onClick={() => onChange(Math.max(min, value - 1))}
      >
        <Text className="s-travel-plan__stats-stepper-btn-label">−</Text>
      </Button>
      <Text className="s-travel-plan__stats-stepper-value">{value}</Text>
      <Button
        className="s-travel-plan__stats-stepper-btn"
        disabled={value >= max}
        hoverClass="s-travel-plan__stats-stepper-btn--pressed"
        aria-label={ariaIncrease}
        onClick={() => onChange(Math.min(max, value + 1))}
      >
        <Text className="s-travel-plan__stats-stepper-btn-label">+</Text>
      </Button>
    </View>
  );
}

export function TravelPlanStatsBar({
  stats,
  copyingSplitSummary = false,
  onSplitCountChange,
  onCopySplitSummary,
}: TravelPlanStatsBarProps) {
  const t = useT();
  const perPersonLabel =
    stats.estimatedPerPerson != null
      ? formatTravelPlanCost(stats.estimatedPerPerson)
      : '--';

  return (
    <View className="s-travel-plan__stats-wrap">
      <View className="s-travel-plan__stats">
        <View className="s-travel-plan__stats-item">
          <Text className="s-travel-plan__stats-value">{stats.nodeCount}</Text>
          <Text className="s-travel-plan__stats-label">
            {t('travelPlan.statsNodeCount')}
          </Text>
        </View>
        <View className="s-travel-plan__stats-divider" aria-hidden />
        <View className="s-travel-plan__stats-item">
          <Text className="s-travel-plan__stats-value">
            {formatTravelPlanCost(stats.estimatedCost)}
          </Text>
          <Text className="s-travel-plan__stats-label">
            {t('travelPlan.statsEstimatedCost')}
          </Text>
        </View>
        <View className="s-travel-plan__stats-divider" aria-hidden />
        <View className="s-travel-plan__stats-item">
          <Text className="s-travel-plan__stats-value">{perPersonLabel}</Text>
          <Text className="s-travel-plan__stats-label">
            {t('travelPlan.statsPerPersonLabel', { count: stats.splitCount })}
          </Text>
        </View>
      </View>

      <View className="s-travel-plan__stats-actions">
        <View className="s-travel-plan__stats-companion">
          <Text className="s-travel-plan__stats-companion-label">
            {t('travelPlan.pageSplitCountLabel')}
          </Text>
          <InlineStepper
            value={clampSplitCount(stats.splitCount)}
            min={MIN_SPLIT_COUNT}
            max={MAX_SPLIT_COUNT}
            onChange={onSplitCountChange}
            ariaDecrease={t('travelPlan.decreaseAria')}
            ariaIncrease={t('travelPlan.increaseAria')}
          />
        </View>
        <Button
          className="s-travel-plan__stats-copy"
          disabled={copyingSplitSummary}
          hoverClass="s-travel-plan__stats-copy--pressed"
          onClick={onCopySplitSummary}
        >
          <Text className="s-travel-plan__stats-copy-label">
            {t('travelPlan.copySplitSummary')}
          </Text>
        </Button>
      </View>

      <Text className="s-travel-plan__stats-disclaimer">
        {t('travelPlan.splitDisclaimer')}
      </Text>
    </View>
  );
}
