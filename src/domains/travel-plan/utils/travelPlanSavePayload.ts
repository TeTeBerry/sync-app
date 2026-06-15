import type { SaveTravelPlanPayload, TravelPlanNodePayload } from '@/types/backend';
import { CALL_CONTAINER_MAX_BODY_BYTES } from '@/utils/cloudRunTransport';
import { isWeappCloudRunTransportEnabled } from '@/constants/cloud';

const MAX_BILL_DESCRIPTION_CHARS = 80;
const MAX_BILL_TITLE_CHARS = 80;
const MAX_NODE_DETAIL_CHARS = 200;

function truncateText(value: string | undefined, maxChars: number): string | undefined {
  const trimmed = value?.trim();
  if (!trimmed) {
    return undefined;
  }
  if (trimmed.length <= maxChars) {
    return trimmed;
  }
  return `${trimmed.slice(0, Math.max(0, maxChars - 1))}…`;
}

function compactBillLineItems(
  bills: TravelPlanNodePayload['diningBills'],
  options?: { stripDescription?: boolean },
) {
  if (!bills?.length) {
    return undefined;
  }

  return bills.map((bill) => {
    const next = {
      ...bill,
      title: truncateText(bill.title, MAX_BILL_TITLE_CHARS) ?? bill.title,
    };

    if (options?.stripDescription) {
      const { description: _description, ...withoutDescription } = next;
      return withoutDescription;
    }

    const description = truncateText(bill.description, MAX_BILL_DESCRIPTION_CHARS);
    return description ? { ...next, description } : next;
  });
}

function compactTravelPlanNode(
  node: TravelPlanNodePayload,
  options?: { stripBillDescription?: boolean },
): TravelPlanNodePayload {
  const hasBills = Boolean(node.diningBills?.length || node.transportBills?.length);
  const diningBills = compactBillLineItems(node.diningBills, {
    stripDescription: options?.stripBillDescription,
  });
  const transportBills = compactBillLineItems(node.transportBills, {
    stripDescription: options?.stripBillDescription,
  });

  const compact: TravelPlanNodePayload = {
    ...node,
    ...(diningBills ? { diningBills } : {}),
    ...(transportBills ? { transportBills } : {}),
  };

  if (hasBills) {
    delete compact.detail;
  } else if (compact.detail) {
    compact.detail = truncateText(compact.detail, MAX_NODE_DETAIL_CHARS);
  }

  if (!diningBills) {
    delete compact.diningBills;
  }
  if (!transportBills) {
    delete compact.transportBills;
  }

  return compact;
}

export function estimateTravelPlanSavePayloadBytes(
  payload: SaveTravelPlanPayload,
): number {
  return JSON.stringify(payload).length;
}

export function resolveTravelPlanSavePayloadByteLimit(): number | undefined {
  return isWeappCloudRunTransportEnabled() ? CALL_CONTAINER_MAX_BODY_BYTES : undefined;
}

export function fitTravelPlanSavePayload(
  payload: SaveTravelPlanPayload,
  maxBytes = resolveTravelPlanSavePayloadByteLimit(),
): SaveTravelPlanPayload {
  if (maxBytes == null) {
    return {
      ...payload,
      nodes: payload.nodes.map((node) => compactTravelPlanNode(node)),
    };
  }

  const compactNodes = payload.nodes.map((node) => compactTravelPlanNode(node));
  let next: SaveTravelPlanPayload = { ...payload, nodes: compactNodes };
  if (estimateTravelPlanSavePayloadBytes(next) <= maxBytes) {
    return next;
  }

  const strippedNodes = payload.nodes.map((node) =>
    compactTravelPlanNode(node, { stripBillDescription: true }),
  );
  next = { ...payload, nodes: strippedNodes };
  if (estimateTravelPlanSavePayloadBytes(next) <= maxBytes) {
    return next;
  }

  throw new Error(
    `行程数据过多（约 ${Math.round(estimateTravelPlanSavePayloadBytes(next) / 1024)}KB），请删除部分账单后再保存`,
  );
}
