import { describe, expect, it } from 'vitest';
import {
  createTravelPlanNodeFromForm,
  sortTravelPlanAddFormValues,
} from '@/domains/travel-plan/utils/travelPlanAddForm';

describe('createTravelPlanNodeFromForm', () => {
  it('builds a pending node from form values', () => {
    const node = createTravelPlanNodeFromForm({
      category: 'hotel',
      timeRange: {
        startDate: '2026-06-13',
        endDate: '2026-06-15',
      },
      title: '入住宝安大酒店',
      description: '含双早',
      cost: '760',
      remark: '预订号 8821',
    });

    expect(node.source).toBe('user');
    expect(node.category).toBe('hotel');
    expect(node.startDate).toBe('2026-06-13');
    expect(node.endDate).toBe('2026-06-15');
    expect(node.timeLabel).toBe('06/13–06/15');
    expect(node.duration).toBe('2晚');
    expect(node.title).toBe('入住宝安大酒店');
    expect(node.subtitle).toBe('含双早');
    expect(node.detail).toBe('预订号 8821');
    expect(node.price).toBe(760);
    expect(node.confirmed).toBe(false);
  });

  it('sorts multi-leg form values by start date', () => {
    const sorted = sortTravelPlanAddFormValues([
      {
        category: 'transport',
        timeRange: { startDate: '2026-06-15', endDate: '2026-06-15' },
        title: '返程上海',
        description: '',
        cost: '',
        remark: '',
      },
      {
        category: 'transport',
        timeRange: { startDate: '2026-06-12', endDate: '2026-06-12' },
        title: '飞往深圳',
        description: '',
        cost: '',
        remark: '',
      },
    ]);

    expect(sorted.map((item) => item.title)).toEqual(['飞往深圳', '返程上海']);
  });
});
