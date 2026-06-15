import { describe, expect, it } from 'vitest';
import { sortTravelPlanNodes } from '@/types/travelPlan';
import {
  createTravelPlanNodesFromFormValues,
  sortTravelPlanAddFormValues,
} from '@/domains/travel-plan/utils/travelPlanAddForm';

describe('createTravelPlanNodesFromFormValues', () => {
  it('builds a pending hotel node from form values', () => {
    const [node] = createTravelPlanNodesFromFormValues([
      {
        category: 'hotel',
        timeRange: {
          startDate: '2026-06-13',
          endDate: '2026-06-15',
        },
        title: '入住宝安大酒店',
        description: '含双早',
        cost: '760',
        remark: '预订号 8821',
      },
    ]);

    expect(node?.source).toBe('user');
    expect(node?.category).toBe('hotel');
    expect(node?.startDate).toBe('2026-06-13');
    expect(node?.endDate).toBe('2026-06-15');
    expect(node?.timeLabel).toBe('06/13–06/15');
    expect(node?.duration).toBe('2晚');
    expect(node?.title).toBe('入住宝安大酒店');
    expect(node?.subtitle).toBe('含双早');
    expect(node?.detail).toBe('预订号 8821');
    expect(node?.price).toBe(760);
    expect(node?.confirmed).toBe(true);
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

  it('groups dining forms by bill date into separate timeline nodes', () => {
    const nodes = createTravelPlanNodesFromFormValues([
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

    expect(nodes).toHaveLength(2);
    expect(nodes[0]?.startDate).toBe('2026-06-14');
    expect(nodes[0]?.endDate).toBe('2026-06-14');
    expect(nodes[0]?.duration).toBeUndefined();
    expect(nodes[0]?.price).toBe(29.9);
    expect(nodes[0]?.diningBills).toHaveLength(1);
    expect(nodes[1]?.startDate).toBe('2026-06-15');
    expect(nodes[1]?.duration).toBeUndefined();
    expect(nodes[1]?.price).toBe(33);
  });

  it('keeps same-day dining forms in one node without duration', () => {
    const [node] = createTravelPlanNodesFromFormValues([
      {
        category: 'dining',
        timeRange: {
          startDate: '2026-06-14',
          endDate: '2026-06-14',
          startTime: '12:10',
        },
        title: '佳能量',
        description: '6/14 12:10',
        cost: '24',
        remark: '',
      },
      {
        category: 'dining',
        timeRange: {
          startDate: '2026-06-14',
          endDate: '2026-06-14',
          startTime: '22:42',
        },
        title: '便利店',
        description: '6/14 22:42',
        cost: '18.7',
        remark: '',
      },
    ]);

    expect(node?.category).toBe('dining');
    expect(node?.startDate).toBe('2026-06-14');
    expect(node?.endDate).toBe('2026-06-14');
    expect(node?.duration).toBeUndefined();
    expect(node?.timeLabel).toBe('06/14 12:10–22:42');
    expect(node?.price).toBe(42.7);
    expect(node?.subtitle).toBe('共 2 笔消费');
    expect(node?.diningBills).toHaveLength(2);
  });

  it('merges multiple ride-hailing transport forms into one node', () => {
    const [node] = createTravelPlanNodesFromFormValues([
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

    expect(node?.category).toBe('transport');
    expect(node?.price).toBe(62.9);
    expect(node?.subtitle).toBe('共 2 笔打车');
    expect(node?.transportBills).toHaveLength(2);
  });

  it('splits batch dining recognition into date-grouped nodes on the timeline', () => {
    const nodes = createTravelPlanNodesFromFormValues([
      {
        category: 'dining',
        timeRange: {
          startDate: '2026-06-14',
          endDate: '2026-06-14',
          startTime: '22:42',
        },
        title: '佳能量',
        description: '6/14 22:42',
        cost: '24',
        remark: '',
      },
      {
        category: 'dining',
        timeRange: {
          startDate: '2026-06-15',
          endDate: '2026-06-15',
          startTime: '01:20',
        },
        title: '夜宵',
        description: '6/15 01:20',
        cost: '35',
        remark: '',
      },
    ]);

    expect(nodes).toHaveLength(2);
    expect(nodes.every((node) => node.duration == null)).toBe(true);
    expect(nodes.map((node) => node.startDate)).toEqual(['2026-06-14', '2026-06-15']);
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

  it('splits mixed batch by category and date for the timeline', () => {
    const nodes = sortTravelPlanNodes(
      createTravelPlanNodesFromFormValues([
        {
          category: 'dining',
          timeRange: {
            startDate: '2026-06-14',
            endDate: '2026-06-14',
            startTime: '12:10',
          },
          title: '佳能量',
          description: '6/14 12:10',
          cost: '24',
          remark: '',
        },
        {
          category: 'transport',
          timeRange: {
            startDate: '2026-06-14',
            endDate: '2026-06-14',
            startTime: '22:42',
          },
          title: '滴滴出行',
          description: '6/14 22:42',
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
      ]),
    );

    expect(nodes).toHaveLength(3);
    expect(nodes.map((node) => `${node.category}:${node.startDate}`)).toEqual([
      'transport:2026-06-14',
      'dining:2026-06-14',
      'dining:2026-06-15',
    ]);
    expect(nodes[0]?.transportBills).toBeUndefined();
    expect(nodes[1]?.diningBills).toHaveLength(1);
  });
});
