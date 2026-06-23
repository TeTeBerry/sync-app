import type { TravelGuideBudgetTier } from '@/types/travelGuide';

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
