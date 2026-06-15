import { describe, expect, it, vi } from 'vitest';
import type { SaveTravelPlanPayload } from '@/types/backend';
import {
  estimateTravelPlanSavePayloadBytes,
  fitTravelPlanSavePayload,
} from '@/domains/travel-plan/utils/travelPlanSavePayload';

vi.mock('@/constants/cloud', () => ({
  isWeappCloudRunTransportEnabled: () => true,
}));

function createBill(index: number) {
  return {
    id: `bill-${index}`,
    title: `账单标题 ${index}`,
    description: `OCR-${index}-`.repeat(80),
    cost: 12.5,
    startDate: '2026-06-14',
    startTime: '12:10',
  };
}

function createPayload(nodeCount: number, billsPerNode: number): SaveTravelPlanPayload {
  return {
    eventMeta: 'Tomorrowland 2026',
    nodes: Array.from({ length: nodeCount }, (_, nodeIndex) => ({
      id: `plan-${nodeIndex}`,
      category: 'dining' as const,
      startDate: '2026-06-14',
      endDate: '2026-06-14',
      title: `餐饮 ${nodeIndex}`,
      subtitle: `共 ${billsPerNode} 笔消费`,
      detail: `${billsPerNode} 笔账单明细`,
      confirmed: true,
      diningBills: Array.from({ length: billsPerNode }, (_, billIndex) =>
        createBill(nodeIndex * billsPerNode + billIndex),
      ),
    })),
    activityConfirmations: {},
    activityPriceOverrides: {},
    hiddenActivityNodeIds: [],
  };
}

describe('travelPlanSavePayload', () => {
  it('compacts oversized bill descriptions to fit callContainer limit', () => {
    const payload = createPayload(12, 10);
    const originalBytes = estimateTravelPlanSavePayloadBytes(payload);
    const fitted = fitTravelPlanSavePayload(payload, 70_000);

    expect(originalBytes).toBeGreaterThan(70_000);
    expect(estimateTravelPlanSavePayloadBytes(fitted)).toBeLessThanOrEqual(70_000);
    expect(fitted.nodes[0]?.detail).toBeUndefined();
    expect(
      fitted.nodes[0]?.diningBills?.[0]?.description?.length ?? 0,
    ).toBeLessThanOrEqual(80);
  });

  it('throws when payload remains too large after compaction', () => {
    const payload = createPayload(20, 12);
    expect(() => fitTravelPlanSavePayload(payload, 20_000)).toThrow(/行程数据过多/);
  });
});
