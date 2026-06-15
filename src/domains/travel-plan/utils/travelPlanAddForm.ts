import {
  createDefaultTravelPlanTimeRange,
  DEFAULT_TRAVEL_PLAN_TIME_RANGE,
  formatTravelPlanDuration,
  formatTravelPlanTimeLabel,
  type TravelPlanTimeRange,
} from './travelPlanDateTime';
import { resolveTravelPlanExpandedDetail } from './travelPlanNodeDisplay';
import { parseTransportTimesFromText } from './travelPlanTransportTime';
import type { TravelPlanCategory, TravelPlanNode } from '../types';
import type { TravelPlanBillLineItem } from '@/types/travelPlan';
import { shouldMergeTransportForms } from './travelPlanTransportBills';

export type TravelPlanAddFormCategory = 'transport' | 'hotel' | 'dining' | 'event';

export type TravelPlanAddFormValues = {
  category: TravelPlanAddFormCategory;
  timeRange: TravelPlanTimeRange;
  title: string;
  description: string;
  cost: string;
  remark: string;
};

const EMPTY_TRAVEL_PLAN_ADD_FORM: TravelPlanAddFormValues = {
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
    const endDiff = a.timeRange.endDate.localeCompare(b.timeRange.endDate);
    if (endDiff !== 0) {
      return endDiff;
    }
    const timeA = a.timeRange.startTime ?? '';
    const timeB = b.timeRange.startTime ?? '';
    return timeA.localeCompare(timeB);
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

function createTravelPlanNodeFromForm(form: TravelPlanAddFormValues): TravelPlanNode {
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

function formatAggregatedBillNodeTitle(
  bills: TravelPlanBillLineItem[],
  fallback: string,
): string {
  const titles = bills.map((bill) => bill.title.trim()).filter(Boolean);
  if (titles.length === 0) {
    return fallback;
  }
  if (titles.length === 1) {
    return titles[0];
  }
  if (titles.length <= 3) {
    return titles.join('、');
  }
  return `${titles[0]} 等 ${titles.length} 笔`;
}

function createAggregatedBillNodeFromForms(
  forms: TravelPlanAddFormValues[],
  options: {
    category: 'dining' | 'transport';
    billIdPrefix: string;
    billsField: 'diningBills' | 'transportBills';
    fallbackTitle: string;
    subtitleSuffix: string;
    includeDuration?: boolean;
  },
): TravelPlanNode {
  const sortedForms = sortTravelPlanAddFormValues(forms);

  const bills: TravelPlanBillLineItem[] = sortedForms.map((form, index) => ({
    id: `${options.billIdPrefix}-${Date.now()}-${index}`,
    title: form.title.trim(),
    description: form.description.trim() || undefined,
    cost: parseTravelPlanCostInput(form.cost),
    startDate: form.timeRange.startDate,
    ...(form.timeRange.startTime ? { startTime: form.timeRange.startTime } : {}),
  }));

  const startForm = sortedForms[0];
  const endForm = sortedForms[sortedForms.length - 1];
  const endTime =
    endForm.timeRange.endTime ??
    (sortedForms.length > 1 ? endForm.timeRange.startTime : undefined);
  const normalizedRange = {
    startDate: startForm.timeRange.startDate,
    endDate: endForm.timeRange.endDate || endForm.timeRange.startDate,
    ...(startForm.timeRange.startTime
      ? { startTime: startForm.timeRange.startTime }
      : {}),
    ...(endTime ? { endTime } : {}),
  };

  const totalCost = bills.reduce((sum, bill) => sum + (bill.cost ?? 0), 0);
  const price = totalCost > 0 ? Math.round(totalCost * 100) / 100 : undefined;
  const title = formatAggregatedBillNodeTitle(bills, options.fallbackTitle);
  const subtitle = `共 ${bills.length} ${options.subtitleSuffix}`;
  const timeLabel = formatTravelPlanTimeLabel(normalizedRange) || '待填写日期';
  const includeDuration = options.includeDuration ?? options.category !== 'dining';
  const duration = includeDuration
    ? formatTravelPlanDuration(normalizedRange)
    : undefined;

  return {
    id: `plan-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`,
    source: 'user',
    category: options.category,
    startDate: normalizedRange.startDate,
    endDate: normalizedRange.endDate,
    ...(normalizedRange.startTime ? { startTime: normalizedRange.startTime } : {}),
    ...(normalizedRange.endTime ? { endTime: normalizedRange.endTime } : {}),
    timeLabel,
    ...(duration ? { duration } : {}),
    title,
    subtitle,
    detail: `${bills.length} 笔账单明细`,
    price,
    confirmed: false,
    [options.billsField]: bills,
  } as TravelPlanNode;
}

function createTravelPlanDiningNodeFromForms(
  forms: TravelPlanAddFormValues[],
): TravelPlanNode {
  return createAggregatedBillNodeFromForms(
    forms.map((form) => ({ ...form, category: 'dining' as const })),
    {
      category: 'dining',
      billIdPrefix: 'dining-bill',
      billsField: 'diningBills',
      fallbackTitle: '餐饮消费',
      subtitleSuffix: '笔消费',
      includeDuration: false,
    },
  );
}

function groupTravelPlanFormsByStartDate(
  forms: TravelPlanAddFormValues[],
): TravelPlanAddFormValues[][] {
  const sortedForms = sortTravelPlanAddFormValues(forms);
  const groups: TravelPlanAddFormValues[][] = [];
  let currentDate = '';
  let currentGroup: TravelPlanAddFormValues[] = [];

  for (const form of sortedForms) {
    const date = form.timeRange.startDate;
    if (date !== currentDate) {
      if (currentGroup.length > 0) {
        groups.push(currentGroup);
      }
      currentDate = date;
      currentGroup = [form];
      continue;
    }
    currentGroup.push(form);
  }

  if (currentGroup.length > 0) {
    groups.push(currentGroup);
  }

  return groups;
}

function createTravelPlanDiningNodesFromForms(
  forms: TravelPlanAddFormValues[],
): TravelPlanNode[] {
  return groupTravelPlanFormsByStartDate(
    forms.map((form) => ({ ...form, category: 'dining' as const })),
  ).map((group) => createTravelPlanDiningNodeFromForms(group));
}

function createTravelPlanTransportNodeFromForms(
  forms: TravelPlanAddFormValues[],
): TravelPlanNode {
  return createAggregatedBillNodeFromForms(
    forms.map((form) => ({ ...form, category: 'transport' as const })),
    {
      category: 'transport',
      billIdPrefix: 'transport-bill',
      billsField: 'transportBills',
      fallbackTitle: '打车出行',
      subtitleSuffix: '笔打车',
    },
  );
}

export function createTravelPlanNodesFromFormValues(
  values: TravelPlanAddFormValues[],
): TravelPlanNode[] {
  const sortedValues = sortTravelPlanAddFormValues(values);
  if (sortedValues.length === 0) {
    return [];
  }

  const nodes: TravelPlanNode[] = [];

  const diningForms = sortedValues.filter((form) => form.category === 'dining');
  if (diningForms.length > 0) {
    nodes.push(...createTravelPlanDiningNodesFromForms(diningForms));
  }

  const transportForms = sortedValues.filter((form) => form.category === 'transport');
  if (transportForms.length > 1 && shouldMergeTransportForms(transportForms)) {
    nodes.push(createTravelPlanTransportNodeFromForms(transportForms));
  } else {
    for (const form of transportForms) {
      nodes.push(createTravelPlanNodeFromForm(form));
    }
  }

  const otherForms = sortedValues.filter(
    (form) => form.category !== 'dining' && form.category !== 'transport',
  );
  for (const form of otherForms) {
    nodes.push(createTravelPlanNodeFromForm(form));
  }

  return nodes;
}
