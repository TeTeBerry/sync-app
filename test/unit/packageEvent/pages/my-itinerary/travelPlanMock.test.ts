import { describe, expect, it } from 'vitest';
import {
  computeTravelPlanStats,
  formatTravelPlanCost,
  TRAVEL_PLAN_MOCK_NODES,
} from '@/packageEvent/pages/my-itinerary/travelPlanMock';

describe('travelPlanMock', () => {
  it('computes stats from mock nodes', () => {
    const stats = computeTravelPlanStats(TRAVEL_PLAN_MOCK_NODES);
    expect(stats.nodeCount).toBe(6);
    expect(stats.estimatedCost).toBe(3085);
    expect(stats.confirmedCount).toBe(5);
  });

  it('formats cost with yen prefix', () => {
    expect(formatTravelPlanCost(3085)).toBe('¥3,085');
  });
});
