import { describe, expect, it } from 'vitest';
import {
  travelPlanNodeFromPayload,
  travelPlanNodeToPayload,
} from '@/packageEvent/pages/my-itinerary/travelPlanApiMapper';

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
    };

    const node = travelPlanNodeFromPayload(payload);
    expect(node.source).toBe('user');
    expect(node.timeLabel).toBe('06/13–06/15');
    expect(travelPlanNodeToPayload(node)).toEqual(payload);
  });
});
