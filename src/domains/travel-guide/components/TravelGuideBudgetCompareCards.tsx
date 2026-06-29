import './TravelGuideBudgetCompareCards.scss';
import { Button, cn } from '@/components/ui';
import { Check, Sparkles } from '@/components/icons';
import {
  getTravelGuideBudgetOptions,
  resolveTravelGuideBudgetTier,
} from '../utils/travelGuideBudgetLabels';
import type {
  TravelGuideBudgetTier,
  TravelGuideBudgetTierSnapshot,
} from '@/types/travelGuide';
import {
  buildTravelGuideTierCompareEstimates,
  buildTravelGuideTierCompareHints,
} from '../utils/travelGuideBudgetCompare.util';
import { useT } from '@/hooks/useI18n';
import { Text, View } from '@tarojs/components';

type TravelGuideBudgetCompareCardsProps = {
  headcount: number;
  accommodationNights: number;
  budgetTierSnapshots?: TravelGuideBudgetTierSnapshot[];
  selectedTier?: TravelGuideBudgetTier;
  updating?: boolean;
  onSelect: (tier: TravelGuideBudgetTier) => void;
};

const TIER_ORDER: TravelGuideBudgetTier[] = ['economy', 'standard', 'comfort'];

export function TravelGuideBudgetCompareCards({
  headcount,
  accommodationNights,
  budgetTierSnapshots,
  selectedTier,
  updating = false,
  onSelect,
}: TravelGuideBudgetCompareCardsProps) {
  const t = useT();
  const resolvedSelectedTier = resolveTravelGuideBudgetTier(selectedTier);
  const estimates = buildTravelGuideTierCompareEstimates({
    headcount,
    accommodationNights,
    budgetTierSnapshots,
  });
  const nightlyHints = buildTravelGuideTierCompareHints({
    budgetTierSnapshots,
    t,
  });
  const options = getTravelGuideBudgetOptions(t).sort(
    (a, b) => TIER_ORDER.indexOf(a.id) - TIER_ORDER.indexOf(b.id),
  );

  return (
    <View className="s-travel-guide-budget-compare">
      <View className="s-travel-guide-budget-compare__header">
        <View className="s-travel-guide-budget-compare__kicker">
          <Sparkles size={11} color="#ffb340" strokeWidth={2.25} aria-hidden />
          <Text className="s-travel-guide-budget-compare__kicker-text">
            {t('travelGuide.budgetCompareKicker')}
          </Text>
        </View>
        <Text className="s-travel-guide-budget-compare__title">
          {t('travelGuide.budgetCompareTitle')}
        </Text>
        <Text className="s-travel-guide-budget-compare__subtitle">
          {t('travelGuide.budgetCompareSubtitle')}
        </Text>
      </View>

      <View className="s-travel-guide-budget-compare__row">
        {options.map((opt) => {
          const active = resolvedSelectedTier === opt.id;
          return (
            <Button
              key={opt.id}
              className={cn(
                's-travel-guide-budget-compare__card',
                `s-travel-guide-budget-compare__card--${opt.id}`,
                active && 's-travel-guide-budget-compare__card--active',
                updating && 's-travel-guide-budget-compare__card--disabled',
              )}
              hoverClass="s-travel-guide-budget-compare__card--pressed"
              disabled={updating}
              onClick={() => onSelect(opt.id)}
            >
              <View
                className="s-travel-guide-budget-compare__card-accent"
                aria-hidden
              />
              {active ? (
                <View className="s-travel-guide-budget-compare__card-check" aria-hidden>
                  <Check size={10} color="#fff" strokeWidth={3} />
                </View>
              ) : null}

              <Text className="s-travel-guide-budget-compare__card-label">
                {opt.label}
              </Text>
              <View className="s-travel-guide-budget-compare__card-nightly">
                <Text className="s-travel-guide-budget-compare__card-hint">
                  {nightlyHints[opt.id]}
                </Text>
                <Text className="s-travel-guide-budget-compare__card-hint-suffix">
                  {t('travelGuide.budgetComparePerNight')}
                </Text>
              </View>

              <View
                className="s-travel-guide-budget-compare__card-divider"
                aria-hidden
              />

              <Text className="s-travel-guide-budget-compare__card-estimate-label">
                {t('travelGuide.budgetCompareStayTotal', {
                  nights: accommodationNights,
                })}
              </Text>
              <Text className="s-travel-guide-budget-compare__card-estimate">
                {estimates[opt.id]}
              </Text>
            </Button>
          );
        })}
      </View>

      <Text className="s-travel-guide-budget-compare__disclaimer">
        {t('travelGuide.budgetCompareDisclaimer')}
      </Text>
    </View>
  );
}
