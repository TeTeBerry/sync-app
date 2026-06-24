import type { TravelPlanBillLineItem } from '@/types/travelPlan';
import type { TravelPlanNode } from '../types';
import type {
  TravelPlanAddFormCategory,
  TravelPlanAddFormValues,
} from './travelPlanAddForm';
import {
  createTravelPlanNodesFromFormValues,
  sortTravelPlanAddFormValues,
} from './travelPlanAddForm';

function mapNodeCategoryToFormCategory(
  category: TravelPlanNode['category'],
): TravelPlanAddFormCategory {
  if (
    category === 'transport' ||
    category === 'hotel' ||
    category === 'dining' ||
    category === 'event'
  ) {
    return category;
  }
  return 'event';
}

function billToAddFormValues(
  bill: TravelPlanBillLineItem,
  category: 'dining' | 'transport',
): TravelPlanAddFormValues {
  return {
    category,
    timeRange: {
      startDate: bill.startDate,
      endDate: bill.startDate,
      ...(bill.startTime ? { startTime: bill.startTime } : {}),
    },
    title: bill.title,
    description: bill.description?.trim() ?? '',
    cost: bill.cost != null && bill.cost > 0 ? String(bill.cost) : '',
    remark: '',
  };
}

function simpleNodeToAddFormValues(node: TravelPlanNode): TravelPlanAddFormValues {
  const category = mapNodeCategoryToFormCategory(node.category);
  const subtitle = node.subtitle?.trim();
  const detail = node.detail?.trim();
  const description =
    subtitle && subtitle !== '待补充详情'
      ? subtitle
      : detail && detail !== node.title
        ? detail
        : '';

  return {
    category,
    timeRange: {
      startDate: node.startDate,
      endDate: node.endDate,
      ...(node.startTime ? { startTime: node.startTime } : {}),
      ...(node.endTime ? { endTime: node.endTime } : {}),
    },
    title: node.title,
    description,
    cost: node.price != null && node.price > 0 ? String(node.price) : '',
    remark:
      detail &&
      detail !== description &&
      !detail.includes('笔账单') &&
      !detail.includes('笔打车')
        ? detail
        : '',
  };
}

export function isEditableTravelPlanNode(node: TravelPlanNode): boolean {
  return node.source === 'user';
}

export function travelPlanNodeToAddFormValues(
  node: TravelPlanNode,
): TravelPlanAddFormValues[] {
  if (node.diningBills?.length) {
    return node.diningBills.map((bill) => billToAddFormValues(bill, 'dining'));
  }
  if (node.transportBills?.length) {
    return node.transportBills.map((bill) => billToAddFormValues(bill, 'transport'));
  }
  return [simpleNodeToAddFormValues(node)];
}

export function rebuildTravelPlanNodesForEdit(
  nodeId: string,
  values: TravelPlanAddFormValues[],
): TravelPlanNode[] {
  const sortedValues = sortTravelPlanAddFormValues(values);
  const rebuilt = createTravelPlanNodesFromFormValues(sortedValues);
  if (rebuilt.length === 1) {
    return [{ ...rebuilt[0], id: nodeId }];
  }
  return rebuilt;
}

export function replaceTravelPlanNodeInList(
  nodes: TravelPlanNode[],
  nodeId: string,
  replacementNodes: TravelPlanNode[],
): TravelPlanNode[] {
  const index = nodes.findIndex((node) => node.id === nodeId);
  if (index === -1) {
    return [...nodes, ...replacementNodes];
  }
  const next = [...nodes];
  next.splice(index, 1, ...replacementNodes);
  return next;
}
