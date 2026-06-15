import { describe, expect, it } from 'vitest';
import {
  createTravelPlanDiningNodeFromForms,
  createTravelPlanNodeFromForm,
  createTravelPlanTransportNodeFromForms,
  createTravelPlanNodesFromFormValues,
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

  it('merges multiple dining forms into one node with total price', () => {
    const node = createTravelPlanDiningNodeFromForms([
      {
        category: 'dining',
        timeRange: {
          startDate: '2026-06-14',
          endDate: '2026-06-14',
          startTime: '19:37',
        },
        title: '国展中心澳园餐厅',
        description: '6/14 19:37',
        cost: '29.9',
        remark: '',
      },
      {
        category: 'dining',
        timeRange: {
          startDate: '2026-06-15',
          endDate: '2026-06-15',
          startTime: '13:53',
        },
        title: '星巴克',
        description: '6/15 13:53',
        cost: '33',
        remark: '',
      },
    ]);

    expect(node.category).toBe('dining');
    expect(node.price).toBe(62.9);
    expect(node.subtitle).toBe('共 2 笔消费');
    expect(node.diningBills).toHaveLength(2);
    expect(node.diningBills?.[0]?.title).toBe('国展中心澳园餐厅');
  });

  it('merges multiple ride-hailing transport forms into one node', () => {
    const node = createTravelPlanTransportNodeFromForms([
      {
        category: 'transport',
        timeRange: {
          startDate: '2026-06-14',
          endDate: '2026-06-14',
          startTime: '19:37',
        },
        title: '滴滴出行',
        description: '6/14 19:37',
        cost: '29.9',
        remark: '',
      },
      {
        category: 'transport',
        timeRange: {
          startDate: '2026-06-15',
          endDate: '2026-06-15',
          startTime: '13:53',
        },
        title: '高德打车',
        description: '6/15 13:53',
        cost: '33',
        remark: '',
      },
    ]);

    expect(node.category).toBe('transport');
    expect(node.price).toBe(62.9);
    expect(node.subtitle).toBe('共 2 笔打车');
    expect(node.transportBills).toHaveLength(2);
  });

  it('keeps round-trip flight forms as separate nodes', () => {
    const nodes = createTravelPlanNodesFromFormValues([
      {
        category: 'transport',
        timeRange: { startDate: '2026-06-12', endDate: '2026-06-12' },
        title: '飞往深圳',
        description: 'CA1234',
        cost: '800',
        remark: '',
      },
      {
        category: 'transport',
        timeRange: { startDate: '2026-06-15', endDate: '2026-06-15' },
        title: '返程上海',
        description: 'CA5678',
        cost: '820',
        remark: '',
      },
    ]);

    expect(nodes).toHaveLength(2);
    expect(nodes[0]?.transportBills).toBeUndefined();
  });
});
