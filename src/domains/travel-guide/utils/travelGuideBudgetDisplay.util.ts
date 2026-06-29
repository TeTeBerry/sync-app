import { t } from '@/i18n';
import type { TravelGuideBudgetItem, TravelGuidePlan } from '@/types/travelGuide';

const TOTAL_BUDGET_LABEL_MARKERS = ['合计', 'total'] as const;

export function isTravelGuideTotalBudgetLabel(label: string): boolean {
  const normalized = label.trim().toLowerCase();
  return TOTAL_BUDGET_LABEL_MARKERS.some((marker) =>
    marker === 'total' ? /\btotal\b/.test(normalized) : label.includes(marker),
  );
}

export function findTravelGuideTotalBudgetItem(
  plan: Pick<TravelGuidePlan, 'budget'>,
): TravelGuideBudgetItem | undefined {
  return plan.budget?.items.find((item) => isTravelGuideTotalBudgetLabel(item.label));
}

export function travelGuideBudgetBannerTitle(headcount: number): string {
  if (headcount > 1) return t('travelGuide.budgetTotalBanner');
  return t('travelGuide.budgetSoloBanner');
}

function parseRangeNumbers(range: string): [number, number] | null {
  const nums = range.match(/\d+/g)?.map(Number) ?? [];
  if (!nums.length) return null;
  if (nums.length === 1) return [nums[0]!, nums[0]!];
  return [nums[0]!, nums[nums.length - 1]!];
}

export function travelGuideBudgetPerPersonRange(
  totalRange: string,
  headcount: number,
): string | null {
  if (headcount <= 1) return null;
  const parsed = parseRangeNumbers(totalRange);
  if (!parsed) return null;
  const [min, max] = parsed;
  const perMin = Math.round(min / headcount);
  const perMax = Math.round(max / headcount);
  if (perMin === perMax) {
    return t('travelGuide.budgetPerPersonSingle', { amount: perMin });
  }
  return t('travelGuide.budgetPerPersonRange', { min: perMin, max: perMax });
}

export function formatTravelGuideBudgetShareLabel(
  totalRange: string,
  headcount: number,
): string {
  const perPerson = travelGuideBudgetPerPersonRange(totalRange, headcount);
  if (perPerson) {
    return t('travelGuide.budgetShareWithPerPerson', {
      total: totalRange,
      perPerson,
    });
  }
  return t('travelGuide.budgetShareTotalOnly', { total: totalRange });
}

/** Hero / cards: short tier label before nightly price parenthetical. */
export function shortTravelGuideBudgetLabel(budgetLabel: string): string {
  const short = budgetLabel.split('(')[0]?.trim();
  return short || budgetLabel;
}
