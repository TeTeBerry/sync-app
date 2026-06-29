import type { TravelGuideBudgetTier } from '@/types/travelGuide';

/** 舒适档 — 首次生成与未选档位时的默认基线 */
export const DEFAULT_TRAVEL_GUIDE_BUDGET_TIER: TravelGuideBudgetTier = 'standard';

export function resolveTravelGuideBudgetTier(
  tier?: TravelGuideBudgetTier | null,
): TravelGuideBudgetTier {
  if (tier === 'economy' || tier === 'standard' || tier === 'comfort') {
    return tier;
  }
  return DEFAULT_TRAVEL_GUIDE_BUDGET_TIER;
}

export function getTravelGuideBudgetOptions(t: (key: string) => string): Array<{
  id: TravelGuideBudgetTier;
  label: string;
  hint: string;
}> {
  return [
    {
      id: 'economy',
      label: t('travelPlan.budgetEconomy'),
      hint: t('travelPlan.budgetEconomyHint'),
    },
    {
      id: 'standard',
      label: t('travelPlan.budgetStandard'),
      hint: t('travelPlan.budgetStandardHint'),
    },
    {
      id: 'comfort',
      label: t('travelPlan.budgetComfort'),
      hint: t('travelPlan.budgetComfortHint'),
    },
  ];
}

export function travelGuideBudgetLabel(
  tier: TravelGuideBudgetTier | undefined,
  t: (key: string) => string,
): string {
  if (!tier) return '';
  const opt = getTravelGuideBudgetOptions(t).find((o) => o.id === tier);
  return opt ? `${opt.label}(${opt.hint})` : tier;
}
