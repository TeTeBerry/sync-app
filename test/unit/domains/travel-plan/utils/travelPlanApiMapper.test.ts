import { describe, expect, it } from 'vitest';
import {
  travelPlanNodeFromSavedPayload,
  travelPlanNodeToPayload,
} from '@/domains/travel-plan/utils/travelPlanApiMapper';

describe('travelPlanApiMapper', () => {
  it('round-trips node payloads', () => {
    const payload = {
      id: 'hotel-1',
      category: 'hotel' as const,
      startDate: '2025-06-13',
      endDate: '2025-06-15',
      duration: '2晚',
      title: '入住酒店',
      subtitle: '宝安大酒店',
      detail: '含双早',
      price: 760,
      confirmed: true,
      splitEnabled: true,
      splitCount: 4,
    };

    const node = travelPlanNodeFromSavedPayload(payload, 'user');
    expect(node.source).toBe('user');
    expect(node.timeLabel).toBe('06/13–06/15');
    expect(node.splitEnabled).toBe(true);
    expect(node.splitCount).toBe(4);
    expect(travelPlanNodeToPayload(node)).toEqual(payload);
  });
});
