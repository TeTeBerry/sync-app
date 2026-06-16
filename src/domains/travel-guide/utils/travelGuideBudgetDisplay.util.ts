import type { TravelGuideBudgetItem, TravelGuidePlan } from '@/types/travelGuide';

export function findTravelGuideTotalBudgetItem(
  plan: Pick<TravelGuidePlan, 'budget'>,
): TravelGuideBudgetItem | undefined {
  return plan.budget?.items.find((item) => item.label.includes('合计'));
}

/** Hero 区预算标题：当前算法为全员/单人全程合计。 */
export function travelGuideBudgetBannerTitle(headcount: number): string {
  if (headcount > 1) return '全程预算参考（合计）';
  return '全程预算参考（单人合计）';
}

function parseRangeNumbers(range: string): [number, number] | null {
  const nums = range.match(/\d+/g)?.map(Number) ?? [];
  if (!nums.length) return null;
  if (nums.length === 1) return [nums[0]!, nums[0]!];
  return [nums[0]!, nums[nums.length - 1]!];
}

/** 由合计区间推算人均（仅 headcount > 1 时展示）。 */
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
  if (perMin === perMax) return `约 ¥${perMin}/人`;
  return `约 ¥${perMin}–${perMax}/人`;
}

export function formatTravelGuideBudgetShareLabel(
  totalRange: string,
  headcount: number,
): string {
  const perPerson = travelGuideBudgetPerPersonRange(totalRange, headcount);
  if (perPerson) return `${totalRange}（合计，${perPerson}）`;
  return `${totalRange}（合计）`;
}
