import type { TravelPlanNode, TravelPlanStats } from '../types';
import { clampSplitCount, computeTravelPlanPerPerson } from './travelPlanSplit.util';

export function computeTravelPlanStats(
  nodes: TravelPlanNode[],
  splitCount: number,
): TravelPlanStats {
  const estimatedCost = nodes.reduce((sum, node) => sum + (node.price ?? 0), 0);
  const splitEligibleCost = nodes.reduce((sum, node) => {
    if (!node.splitEnabled || node.price == null) {
      return sum;
    }
    return sum + node.price;
  }, 0);
  const normalizedSplitCount = clampSplitCount(splitCount);
  const estimatedPerPerson =
    splitEligibleCost > 0
      ? computeTravelPlanPerPerson(splitEligibleCost, normalizedSplitCount)
      : null;

  return {
    nodeCount: nodes.length,
    estimatedCost,
    splitCount: normalizedSplitCount,
    splitEligibleCost,
    estimatedPerPerson,
  };
}

export function formatTravelPlanCost(amount: number): string {
  return `¥${amount.toLocaleString('zh-CN')}`;
}
