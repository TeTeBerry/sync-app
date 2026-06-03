import type { LiveInfoZone } from '../../../types/backend';
import type { LiveInfoCategoryId } from './liveInfoConfig';

export type LiveInfoSummaryRow = {
  categoryId: LiveInfoCategoryId;
  score: number;
};

export type LiveInfoFeedItem = {
  id: string;
  userName: string;
  avatar?: string;
  authorOnSiteVerified?: boolean;
  zoneTag: string;
  zoneLabel: string;
  timeLabel: string;
  ratings: { categoryId: LiveInfoCategoryId; score: number }[];
  remark?: string;
  likes: number;
  liked?: boolean;
};

export const MOCK_LIVE_INFO_ZONES: LiveInfoZone[] = [
  { id: 'stage_a', label: 'A 舞台' },
  { id: 'stage_b', label: 'B 舞台' },
  { id: 'vip_booth', label: '卡座' },
  { id: 'venue', label: '全场' },
];

export const MOCK_LIVE_INFO_SUMMARY: LiveInfoSummaryRow[] = [
  { categoryId: 'entry_crowd', score: 3.6 },
  { categoryId: 'toilet_queue', score: 3.4 },
  { categoryId: 'water_queue', score: 3.1 },
  { categoryId: 'smoke_drink', score: 3.0 },
  { categoryId: 'sound_level', score: 3.8 },
  { categoryId: 'stage_view', score: 3.2 },
];

export const MOCK_LIVE_INFO_CERT_COUNT = 8;

type ResolveOptions = { apiMode?: boolean };

export function resolveLiveInfoZones(
  zones: LiveInfoZone[] | undefined | null,
  apiMode?: boolean,
): LiveInfoZone[] {
  if (Array.isArray(zones) && zones.length > 0) return zones;
  if (!apiMode) return MOCK_LIVE_INFO_ZONES;
  return [{ id: 'venue', label: '全场' }];
}

/** Use demo feed when API is off or returns no updates yet. */
export function resolveLiveInfoFeed(
  feed: LiveInfoFeedItem[] | undefined | null,
  options?: ResolveOptions,
): LiveInfoFeedItem[] {
  if (Array.isArray(feed) && feed.length > 0) return feed;
  if (options?.apiMode) return [];
  return MOCK_LIVE_INFO_FEED;
}

export function resolveLiveInfoSummary(
  summary: LiveInfoSummaryRow[] | undefined | null,
  options?: ResolveOptions,
): LiveInfoSummaryRow[] {
  if (Array.isArray(summary) && summary.length > 0) return summary;
  if (options?.apiMode) return [];
  return MOCK_LIVE_INFO_SUMMARY;
}

export function resolveLiveInfoCertCount(
  certCount: number | undefined | null,
  feed: LiveInfoFeedItem[] | undefined | null,
  options?: ResolveOptions,
): number {
  if (typeof certCount === 'number' && certCount >= 0) return certCount;
  const hasFeed = Array.isArray(feed) && feed.length > 0;
  if (options?.apiMode && hasFeed) return certCount ?? 0;
  if (options?.apiMode) return 0;
  return MOCK_LIVE_INFO_CERT_COUNT;
}

/** Varied feed posts for mock / offline preview (grid layouts: 1, 2, 3, 4 metrics). */
export const MOCK_LIVE_INFO_FEED: LiveInfoFeedItem[] = [
  {
    id: 'live-1',
    userName: '深圳老炮',
    avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=200&q=80',
    authorOnSiteVerified: true,
    zoneTag: 'stage_a',
    zoneLabel: 'A 舞台',
    timeLabel: '2分钟前',
    ratings: [
      { categoryId: 'entry_crowd', score: 4 },
      { categoryId: 'sound_level', score: 4 },
      { categoryId: 'stage_view', score: 3 },
    ],
    remark: '主舞台低音很足，前排视野不错；北门比南门好进',
    likes: 12,
  },
  {
    id: 'live-2',
    userName: 'Luna',
    avatar: 'https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=200&q=80',
    authorOnSiteVerified: true,
    zoneTag: 'stage_b',
    zoneLabel: 'B 舞台',
    timeLabel: '8分钟前',
    ratings: [
      { categoryId: 'toilet_queue', score: 5 },
      { categoryId: 'water_queue', score: 4 },
    ],
    remark: 'B区厕所排了快半小时；补水点只有主通道两个在出水',
    likes: 6,
  },
  {
    id: 'live-3',
    userName: '现场小白',
    avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=200&q=80',
    authorOnSiteVerified: true,
    zoneTag: 'venue',
    zoneLabel: '全场',
    timeLabel: '15分钟前',
    ratings: [
      { categoryId: 'entry_crowd', score: 2 },
      { categoryId: 'toilet_queue', score: 2 },
      { categoryId: 'water_queue', score: 2 },
      { categoryId: 'smoke_drink', score: 2 },
    ],
    remark: '下午三点入场很顺，整体不算挤，安检基本不用排队',
    likes: 3,
  },
  {
    id: 'live-4',
    userName: '蹦迪选手阿凯',
    avatar: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=200&q=80',
    authorOnSiteVerified: true,
    zoneTag: 'vip_booth',
    zoneLabel: '卡座',
    timeLabel: '22分钟前',
    ratings: [
      { categoryId: 'entry_crowd', score: 5 },
      { categoryId: 'smoke_drink', score: 4.5 },
      { categoryId: 'sound_level', score: 2 },
    ],
    remark: '卡座区音量适中；南门刚限流，建议走西侧散客口',
    likes: 21,
    liked: true,
  },
  {
    id: 'live-5',
    userName: '啤酒爱好者',
    avatar: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=200&q=80',
    zoneTag: 'venue',
    zoneLabel: '全场',
    timeLabel: '31分钟前',
    ratings: [
      { categoryId: 'smoke_drink', score: 1 },
      { categoryId: 'water_queue', score: 1 },
    ],
    remark: '安检区很空，入场很快；免费饮水台在医疗帐篷旁边',
    likes: 4,
  },
  {
    id: 'live-6',
    userName: '小雨',
    avatar: 'https://images.unsplash.com/photo-1544005313-94ddf0286df2?w=200&q=80',
    authorOnSiteVerified: true,
    zoneTag: 'stage_a',
    zoneLabel: 'A 舞台',
    timeLabel: '38分钟前',
    ratings: [{ categoryId: 'toilet_queue', score: 4 }],
    remark: 'VIP 通道畅通，普通口要排二十分钟左右',
    likes: 8,
  },
  {
    id: 'live-7',
    userName: '主理人 Nico',
    avatar: 'https://images.unsplash.com/photo-1519345182560-3f2917c472ef?w=200&q=80',
    authorOnSiteVerified: true,
    zoneTag: 'stage_b',
    zoneLabel: 'B 舞台',
    timeLabel: '48分钟前',
    ratings: [
      { categoryId: 'water_queue', score: 5 },
      { categoryId: 'toilet_queue', score: 3 },
      { categoryId: 'entry_crowd', score: 4 },
      { categoryId: 'stage_view', score: 4 },
    ],
    remark: '散场高峰：接水点排长队，建议去 C 区后方自动售货机',
    likes: 15,
  },
  {
    id: 'live-8',
    userName: 'Jade',
    avatar: 'https://images.unsplash.com/photo-1524504388940-b1c1722653e1?w=200&q=80',
    authorOnSiteVerified: true,
    zoneTag: 'venue',
    zoneLabel: '全场',
    timeLabel: '55分钟前',
    ratings: [{ categoryId: 'smoke_drink', score: 5 }],
    remark: '场内禁烟但室外吸烟区爆满',
    likes: 2,
  },
  {
    id: 'live-9',
    userName: '电音迷妹',
    avatar: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=200&q=80',
    authorOnSiteVerified: true,
    zoneTag: 'stage_a',
    zoneLabel: 'A 舞台',
    timeLabel: '1小时前',
    ratings: [
      { categoryId: 'entry_crowd', score: 3.5 },
      { categoryId: 'sound_level', score: 5 },
    ],
    likes: 9,
  },
];
