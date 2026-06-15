import type { SavedTravelPlanNode, TravelPlanNodePayload } from '@/types/backend';
import {
  formatTravelPlanDuration,
  formatTravelPlanTimeLabel,
} from './travelPlanDateTime';
import type { TravelPlanNode } from '../types';

export function travelPlanNodeToPayload(node: TravelPlanNode): TravelPlanNodePayload {
  return {
    id: node.id,
    category: node.category,
    startDate: node.startDate,
    endDate: node.endDate,
    ...(node.startTime ? { startTime: node.startTime } : {}),
    ...(node.endTime ? { endTime: node.endTime } : {}),
    ...(node.duration ? { duration: node.duration } : {}),
    title: node.title,
    subtitle: node.subtitle,
    ...(node.detail ? { detail: node.detail } : {}),
    ...(node.price != null ? { price: node.price } : {}),
    confirmed: true,
    ...(node.diningBills?.length ? { diningBills: node.diningBills } : {}),
    ...(node.transportBills?.length ? { transportBills: node.transportBills } : {}),
  };
}

function travelPlanNodeFromPayload(payload: TravelPlanNodePayload): TravelPlanNode {
  const timeRange = {
    startDate: payload.startDate,
    endDate: payload.endDate,
    ...(payload.startTime ? { startTime: payload.startTime } : {}),
    ...(payload.endTime ? { endTime: payload.endTime } : {}),
  };
  const duration =
    payload.duration?.trim() || formatTravelPlanDuration(timeRange) || undefined;

  return {
    id: payload.id,
    source: 'user',
    category: payload.category,
    startDate: payload.startDate,
    endDate: payload.endDate,
    ...(payload.startTime ? { startTime: payload.startTime } : {}),
    ...(payload.endTime ? { endTime: payload.endTime } : {}),
    timeLabel: formatTravelPlanTimeLabel(timeRange),
    ...(duration ? { duration } : {}),
    title: payload.title,
    subtitle: payload.subtitle,
    ...(payload.detail ? { detail: payload.detail } : {}),
    ...(payload.price != null ? { price: payload.price } : {}),
    confirmed: payload.confirmed,
    ...(payload.diningBills?.length ? { diningBills: payload.diningBills } : {}),
    ...(payload.transportBills?.length
      ? { transportBills: payload.transportBills }
      : {}),
  };
}

export function travelPlanNodesFromPayloads(
  payloads: TravelPlanNodePayload[],
): TravelPlanNode[] {
  return payloads.map(travelPlanNodeFromPayload);
}

export function travelPlanNodeFromSavedPayload(
  payload: SavedTravelPlanNode,
  source: 'activity' | 'user',
): TravelPlanNode {
  const node = travelPlanNodeFromPayload(payload);
  const timeRange = {
    startDate: payload.startDate,
    endDate: payload.endDate,
    ...(payload.startTime ? { startTime: payload.startTime } : {}),
    ...(payload.endTime ? { endTime: payload.endTime } : {}),
  };

  return {
    ...node,
    source,
    timeLabel: payload.timeLabel?.trim() || node.timeLabel,
    ...(payload.startTime ? { startTime: payload.startTime } : {}),
    ...(payload.endTime ? { endTime: payload.endTime } : {}),
    ...(payload.duration
      ? { duration: payload.duration }
      : node.duration
        ? { duration: node.duration }
        : {}),
    ...(payload.detail ? { detail: payload.detail } : {}),
    ...(payload.price != null ? { price: payload.price } : {}),
    confirmed: payload.confirmed,
    title: payload.title,
    subtitle: payload.subtitle,
    startDate: timeRange.startDate,
    endDate: timeRange.endDate,
    ...(payload.diningBills?.length ? { diningBills: payload.diningBills } : {}),
    ...(payload.transportBills?.length
      ? { transportBills: payload.transportBills }
      : {}),
  };
}
