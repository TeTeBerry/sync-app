import type { TravelPlanNode, TravelPlanNodeSource } from './travelPlanTypes';

const CATEGORY_ORDER: Record<TravelPlanNode['category'], number> = {
  flight: 0,
  transport: 1,
  hotel: 2,
  dining: 3,
  event: 4,
};

export function isActivityTravelPlanNodeId(id: string) {
  return id.startsWith('activity-event-');
}

export function normalizeHiddenActivityNodeIds(ids: string[]) {
  return [...new Set(ids.filter((id) => isActivityTravelPlanNodeId(id.trim())))];
}

export function filterUserTravelPlanNodes(nodes: TravelPlanNode[]) {
  return nodes.filter(
    (node) =>
      node.source === 'user' ||
      (!isActivityTravelPlanNodeId(node.id) && node.category !== 'event'),
  );
}

export function sortTravelPlanNodes(nodes: TravelPlanNode[]): TravelPlanNode[] {
  return [...nodes].sort((a, b) => {
    const dateDiff = a.startDate.localeCompare(b.startDate);
    if (dateDiff !== 0) {
      return dateDiff;
    }

    const categoryDiff = CATEGORY_ORDER[a.category] - CATEGORY_ORDER[b.category];
    if (categoryDiff !== 0) {
      return categoryDiff;
    }

    const timeDiff = (a.startTime ?? '00:00').localeCompare(b.startTime ?? '00:00');
    if (timeDiff !== 0) {
      return timeDiff;
    }

    if (a.category === 'hotel' && a.endDate !== b.endDate) {
      return a.endDate.localeCompare(b.endDate);
    }

    return a.id.localeCompare(b.id);
  });
}

export function mergeTravelPlanNodes(
  activityNodes: TravelPlanNode[],
  userNodes: TravelPlanNode[],
): TravelPlanNode[] {
  return sortTravelPlanNodes([
    ...activityNodes.map((node) => ({
      ...node,
      source: 'activity' as TravelPlanNodeSource,
    })),
    ...userNodes.map((node) => ({ ...node, source: 'user' as TravelPlanNodeSource })),
  ]);
}

export function applyActivityNodeOverrides(
  activityNodes: TravelPlanNode[],
  activityConfirmations: Record<string, boolean>,
  activityPriceOverrides: Record<string, number>,
): TravelPlanNode[] {
  return activityNodes.map((node) => {
    const priceOverride = activityPriceOverrides[node.id];
    const next: TravelPlanNode = {
      ...node,
      confirmed: activityConfirmations[node.id] ?? node.confirmed,
    };

    if (priceOverride != null && Number.isFinite(priceOverride) && priceOverride >= 0) {
      next.price = priceOverride;
    }

    return next;
  });
}
