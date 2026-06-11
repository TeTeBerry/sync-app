import {
  createDefaultTravelPlanTimeRange,
  DEFAULT_TRAVEL_PLAN_TIME_RANGE,
  formatTravelPlanDuration,
  formatTravelPlanTimeLabel,
  type TravelPlanTimeRange,
} from './travelPlanDateTime';
import { resolveTravelPlanExpandedDetail } from './travelPlanNodeDisplay';
import { parseTransportTimesFromText } from './travelPlanTransportTime';
import type { TravelPlanCategory, TravelPlanNode } from './travelPlanTypes';

export type TravelPlanAddFormCategory = 'transport' | 'hotel' | 'dining' | 'event';

export type TravelPlanAddFormValues = {
  category: TravelPlanAddFormCategory;
  timeRange: TravelPlanTimeRange;
  title: string;
  description: string;
  cost: string;
  remark: string;
};

export const EMPTY_TRAVEL_PLAN_ADD_FORM: TravelPlanAddFormValues = {
  category: 'hotel',
  timeRange: DEFAULT_TRAVEL_PLAN_TIME_RANGE,
  title: '',
  description: '',
  cost: '',
  remark: '',
};

export function createEmptyTravelPlanAddForm(
  category: TravelPlanAddFormCategory = 'hotel',
): TravelPlanAddFormValues {
  return {
    ...EMPTY_TRAVEL_PLAN_ADD_FORM,
    category,
    timeRange: createDefaultTravelPlanTimeRange(),
  };
}

export function sortTravelPlanAddFormValues(
  values: TravelPlanAddFormValues[],
): TravelPlanAddFormValues[] {
  return [...values].sort((a, b) => {
    const startDiff = a.timeRange.startDate.localeCompare(b.timeRange.startDate);
    if (startDiff !== 0) {
      return startDiff;
    }
    return a.timeRange.endDate.localeCompare(b.timeRange.endDate);
  });
}

export function parseTravelPlanCostInput(raw: string): number | undefined {
  const digits = raw.replace(/[^\d.]/g, '').trim();
  if (!digits) {
    return undefined;
  }
  const value = Number.parseFloat(digits);
  return Number.isFinite(value) && value >= 0 ? value : undefined;
}

export function createTravelPlanNodeFromForm(
  form: TravelPlanAddFormValues,
): TravelPlanNode {
  const title = form.title.trim();
  const description = form.description.trim();
  const remark = form.remark.trim();
  const subtitle = description || remark || '待补充详情';

  const includeTimes = form.category !== 'hotel';
  const parsedTransportTimes =
    includeTimes && form.category === 'transport'
      ? parseTransportTimesFromText(`${description} ${remark}`)
      : {};
  const normalizedRange = {
    startDate: form.timeRange.startDate,
    endDate: form.timeRange.endDate,
    ...(includeTimes && (form.timeRange.startTime ?? parsedTransportTimes.startTime)
      ? { startTime: form.timeRange.startTime ?? parsedTransportTimes.startTime }
      : {}),
    ...(includeTimes && (form.timeRange.endTime ?? parsedTransportTimes.endTime)
      ? { endTime: form.timeRange.endTime ?? parsedTransportTimes.endTime }
      : {}),
  };
  const draftNode = {
    subtitle,
    detail: remark && remark !== description ? remark : undefined,
  };
  const detail = resolveTravelPlanExpandedDetail(draftNode);
  const timeLabel = formatTravelPlanTimeLabel(normalizedRange) || '待填写日期';
  const duration = formatTravelPlanDuration(normalizedRange);

  return {
    id: `plan-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`,
    source: 'user',
    category: form.category as TravelPlanCategory,
    startDate: normalizedRange.startDate,
    endDate: normalizedRange.endDate,
    ...(normalizedRange.startTime ? { startTime: normalizedRange.startTime } : {}),
    ...(normalizedRange.endTime ? { endTime: normalizedRange.endTime } : {}),
    timeLabel,
    ...(duration ? { duration } : {}),
    title,
    subtitle,
    detail,
    price: parseTravelPlanCostInput(form.cost),
    confirmed: false,
  };
}
