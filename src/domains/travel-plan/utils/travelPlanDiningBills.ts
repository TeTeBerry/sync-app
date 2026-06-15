import type { TravelPlanBillLineItem } from '@/types/travelPlan';
import { formatTravelPlanTimeLabel } from './travelPlanDateTime';

export function formatDiningBillMeta(bill: TravelPlanBillLineItem): string {
  const description = bill.description?.trim();
  if (description) {
    return description;
  }

  return (
    formatTravelPlanTimeLabel({
      startDate: bill.startDate,
      endDate: bill.startDate,
      ...(bill.startTime ? { startTime: bill.startTime } : {}),
    }) || bill.startDate
  );
}

export function formatDiningBillCost(cost?: number): string | undefined {
  if (cost == null || !Number.isFinite(cost)) {
    return undefined;
  }
  return `¥${cost % 1 === 0 ? cost : cost.toFixed(2)}`;
}
