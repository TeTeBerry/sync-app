import { describe, expect, it } from 'vitest';
import { sortTravelPlanNodes } from '@sync/travel-plan-contracts';
import type { TravelPlanNode } from '@/domains/travel-plan/types';

const baseNode = (
  partial: Partial<TravelPlanNode> &
    Pick<TravelPlanNode, 'id' | 'category' | 'startDate'>,
): TravelPlanNode => ({
  source: 'user',
  endDate: partial.startDate,
  timeLabel: '06/13',
  title: partial.title ?? partial.id,
  subtitle: '副标题',
  confirmed: true,
  ...partial,
});

describe('sortTravelPlanNodes hotel timeline', () => {
  it('orders hotels by check-in and check-out dates without clock times', () => {
    const sorted = sortTravelPlanNodes([
      baseNode({
        id: 'hotel-long',
        category: 'hotel',
        startDate: '2025-06-13',
        endDate: '2025-06-15',
      }),
      baseNode({
        id: 'hotel-short',
        category: 'hotel',
        startDate: '2025-06-13',
        endDate: '2025-06-14',
      }),
      baseNode({
        id: 'flight',
        category: 'flight',
        startDate: '2025-06-13',
        startTime: '10:30',
      }),
    ]);

    expect(sorted.map((node) => node.id)).toEqual([
      'flight',
      'hotel-short',
      'hotel-long',
    ]);
  });
});
