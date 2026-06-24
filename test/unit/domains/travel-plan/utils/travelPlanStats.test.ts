import { describe, expect, it } from 'vitest';
import type { TravelPlanNode } from '@/domains/travel-plan/types';
import {
  computeTravelPlanStats,
  formatTravelPlanCost,
} from '@/domains/travel-plan/utils/travelPlanStats';

const SAMPLE_NODES: TravelPlanNode[] = [
  {
    id: 'flight',
    source: 'user',
    category: 'flight',
    startDate: '2025-06-13',
    endDate: '2025-06-13',
    timeLabel: '06/13',
    title: '上海 → 深圳',
    confirmed: true,
    price: 680,
  },
  {
    id: 'hotel',
    source: 'user',
    category: 'hotel',
    startDate: '2025-06-13',
    endDate: '2025-06-15',
    timeLabel: '06/13–06/15',
    title: '酒店',
    confirmed: false,
    price: 760,
  },
];

describe('travelPlanStats', () => {
  it('computes stats from nodes', () => {
    const stats = computeTravelPlanStats(SAMPLE_NODES, 2);
    expect(stats.nodeCount).toBe(2);
    expect(stats.estimatedCost).toBe(1440);
    expect(stats.splitCount).toBe(2);
    expect(stats.splitEligibleCost).toBe(0);
    expect(stats.estimatedPerPerson).toBeNull();
  });

  it('computes per-person from split-enabled nodes only', () => {
    const stats = computeTravelPlanStats(
      [
        ...SAMPLE_NODES,
        {
          ...SAMPLE_NODES[0],
          id: 'dining',
          category: 'dining',
          title: '餐饮',
          price: 800,
          splitEnabled: true,
          splitCount: 4,
        },
      ],
      4,
    );
    expect(stats.splitEligibleCost).toBe(800);
    expect(stats.estimatedPerPerson).toBe(200);
  });

  it('formats cost in zh-CN locale', () => {
    expect(formatTravelPlanCost(1440)).toBe('¥1,440');
  });
});
