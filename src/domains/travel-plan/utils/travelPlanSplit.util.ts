import type { TravelPlanNode } from '../types';
import { formatTravelPlanCost } from './travelPlanStats';

export const MIN_SPLIT_COUNT = 2;
export const MAX_SPLIT_COUNT = 8;
export const DEFAULT_SPLIT_COUNT = 2;

export function clampSplitCount(value: number): number {
  if (!Number.isFinite(value)) {
    return DEFAULT_SPLIT_COUNT;
  }
  const rounded = Math.round(value);
  return Math.min(MAX_SPLIT_COUNT, Math.max(MIN_SPLIT_COUNT, rounded));
}

export function resolveDefaultSplitCount(input: {
  queryHeadcount?: number | null;
  savedSplitCount?: number | null;
  guideHeadcount?: number | null;
}): number {
  if (input.queryHeadcount != null && input.queryHeadcount > 0) {
    return clampSplitCount(input.queryHeadcount);
  }
  if (input.savedSplitCount != null && input.savedSplitCount > 0) {
    return clampSplitCount(input.savedSplitCount);
  }
  if (input.guideHeadcount != null && input.guideHeadcount > 0) {
    return clampSplitCount(input.guideHeadcount);
  }
  return DEFAULT_SPLIT_COUNT;
}

export function computeTravelPlanPerPerson(
  total: number,
  count: number,
): number | null {
  if (!Number.isFinite(total) || total <= 0 || count < MIN_SPLIT_COUNT) {
    return null;
  }
  return Math.round(total / count);
}

export function formatNodeSplitLabel(
  price: number | undefined,
  splitEnabled: boolean | undefined,
  splitCount: number | undefined,
): string | null {
  if (!splitEnabled || price == null || price <= 0) {
    return null;
  }
  const count = clampSplitCount(splitCount ?? DEFAULT_SPLIT_COUNT);
  const perPerson = computeTravelPlanPerPerson(price, count);
  if (perPerson == null) {
    return null;
  }
  return `${formatTravelPlanCost(price)} · ${count} 人 · 人均 ${formatTravelPlanCost(perPerson)}`;
}

export function filterSplitEnabledNodes(nodes: TravelPlanNode[]): TravelPlanNode[] {
  return nodes.filter(
    (node) => node.splitEnabled && node.price != null && node.price > 0,
  );
}

export function buildTravelPlanSplitSummaryText(input: {
  eventName: string;
  nodes: TravelPlanNode[];
  splitCount: number;
  disclaimer: string;
}): string {
  const lines: string[] = [];
  const title = input.eventName.trim() || '行程记账';
  lines.push(title);
  lines.push('');

  const splitNodes = filterSplitEnabledNodes(input.nodes);
  for (const node of splitNodes) {
    const label = node.title.trim() || '未命名';
    const count = clampSplitCount(node.splitCount ?? input.splitCount);
    const perPerson = computeTravelPlanPerPerson(node.price!, count);
    if (perPerson != null) {
      lines.push(
        `${label} · ${formatTravelPlanCost(node.price!)} · 人均 ${formatTravelPlanCost(perPerson)}`,
      );
    }
  }

  lines.push('');
  lines.push(input.disclaimer);
  return lines.join('\n');
}
