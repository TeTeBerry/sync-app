import { buildDefaultActivityTravelPlanNodes } from './travelPlanActivityNodes';
import type { TravelPlanNode, TravelPlanStats } from './travelPlanTypes';

export const TRAVEL_PLAN_EVENT_META = '风暴电音节 深圳站';
export const TRAVEL_PLAN_DATE_RANGE = '06/13–14';
export const TRAVEL_PLAN_MOCK_ACTIVITY_LEGACY_ID = 4;

export const TRAVEL_PLAN_MOCK_ACTIVITY_NODES: TravelPlanNode[] =
  buildDefaultActivityTravelPlanNodes({
    activityLegacyId: TRAVEL_PLAN_MOCK_ACTIVITY_LEGACY_ID,
    eventName: TRAVEL_PLAN_EVENT_META,
    activityDate: '06/13-14',
    location: '深圳国际会展中心',
  });

export const TRAVEL_PLAN_MOCK_USER_NODES: TravelPlanNode[] = [
  {
    id: 'flight-in',
    source: 'user',
    category: 'flight',
    startDate: '2025-06-13',
    endDate: '2025-06-13',
    timeLabel: '06/13',
    duration: '2h 30min',
    title: '上海虹桥 → 深圳宝安机场',
    subtitle: '东方航空 MU5419',
    detail: '飞行时长约 2h 30min · 经济舱',
    price: 680,
    confirmed: true,
  },
  {
    id: 'transfer-in',
    source: 'user',
    category: 'transport',
    startDate: '2025-06-13',
    endDate: '2025-06-13',
    timeLabel: '06/13',
    duration: '35min',
    title: '宝安机场 → 深圳国际会展中心',
    subtitle: '出租车 / 滴滴',
    detail: '建议提前预约网约车，避开高峰拥堵',
    price: 55,
    confirmed: true,
  },
  {
    id: 'hotel',
    source: 'user',
    category: 'hotel',
    startDate: '2025-06-13',
    endDate: '2025-06-15',
    timeLabel: '06/13–06/15',
    duration: '2晚',
    title: '入住宝安大酒店',
    subtitle: '深圳市宝安区展城一路 28 号',
    detail: '含双早 · 可延迟退房至 14:00',
    price: 760,
    confirmed: true,
  },
  {
    id: 'flight-out',
    source: 'user',
    category: 'flight',
    startDate: '2025-06-15',
    endDate: '2025-06-15',
    timeLabel: '06/15',
    duration: '2h 30min',
    title: '深圳宝安机场 → 上海虹桥',
    subtitle: '东方航空 MU5420',
    detail: '飞行时长约 2h 30min · 经济舱',
    price: 710,
    confirmed: false,
  },
];

export const TRAVEL_PLAN_MOCK_NODES: TravelPlanNode[] = [
  ...TRAVEL_PLAN_MOCK_USER_NODES.slice(0, 3),
  ...TRAVEL_PLAN_MOCK_ACTIVITY_NODES,
  TRAVEL_PLAN_MOCK_USER_NODES[3]!,
];

export function computeTravelPlanStats(nodes: TravelPlanNode[]): TravelPlanStats {
  return {
    nodeCount: nodes.length,
    estimatedCost: nodes.reduce((sum, node) => sum + (node.price ?? 0), 0),
    confirmedCount: nodes.filter((node) => node.confirmed).length,
  };
}

export function formatTravelPlanCost(amount: number): string {
  return `¥${amount.toLocaleString('zh-CN')}`;
}
