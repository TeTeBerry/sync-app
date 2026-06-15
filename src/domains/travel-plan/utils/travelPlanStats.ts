import type { TravelPlanNode, TravelPlanStats } from '../types';

export function computeTravelPlanStats(nodes: TravelPlanNode[]): TravelPlanStats {
  return {
    nodeCount: nodes.length,
    estimatedCost: nodes.reduce((sum, node) => sum + (node.price ?? 0), 0),
  };
}

export function formatTravelPlanCost(amount: number): string {
  return `¥${amount.toLocaleString('zh-CN')}`;
}
