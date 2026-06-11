import {
  formatTravelPlanDuration,
  formatTravelPlanTimeLabel,
} from './travelPlanDateTime';
import type { TravelPlanNode } from './travelPlanTypes';

export function resolveTravelPlanYearHint(input?: {
  activityDate?: string;
  eventName?: string;
}): string {
  const fromDate = input?.activityDate?.match(/\b(20\d{2})\b/)?.[1];
  if (fromDate) {
    return fromDate;
  }

  const fromName = input?.eventName?.match(/\b(20\d{2})\b/)?.[1];
  if (fromName) {
    return fromName;
  }

  return String(new Date().getFullYear());
}

export function alignIsoDateToYear(isoDate: string, yearHint: string): string {
  const match = isoDate.trim().match(/^(\d{4})-(\d{2})-(\d{2})$/);
  if (!match || match[1] === yearHint) {
    return isoDate;
  }

  return `${yearHint}-${match[2]}-${match[3]}`;
}

export function alignTravelPlanNodeYear(
  node: TravelPlanNode,
  yearHint: string,
): TravelPlanNode {
  const startDate = alignIsoDateToYear(node.startDate, yearHint);
  const endDate = alignIsoDateToYear(node.endDate, yearHint);
  if (startDate === node.startDate && endDate === node.endDate) {
    return node;
  }

  const timeRange = {
    startDate,
    endDate,
    ...(node.startTime ? { startTime: node.startTime } : {}),
    ...(node.endTime ? { endTime: node.endTime } : {}),
  };
  const duration = formatTravelPlanDuration(timeRange);

  return {
    ...node,
    startDate,
    endDate,
    timeLabel: formatTravelPlanTimeLabel(timeRange),
    ...(duration ? { duration } : {}),
  };
}

export function alignTravelPlanNodesYear(
  nodes: TravelPlanNode[],
  yearHint: string,
): TravelPlanNode[] {
  return nodes.map((node) => alignTravelPlanNodeYear(node, yearHint));
}
