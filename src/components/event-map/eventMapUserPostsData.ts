import type {
  EventDetailPost,
  ProfilePostItem,
  ProfileSummary,
} from '../../types/backend';
import type { EventMapMarker } from './eventMapMarkers';

export type EventMapUserPost = {
  id: string;
  contentTypes?: EventDetailPost['contentTypes'];
  location: string;
  timeLabel: string;
  body: string;
  images?: string[];
  likes: number;
  comments: number;
};

export type EventMapUserSheetData = {
  displayName: string;
  emoji?: string;
  statusText: string;
  posts: EventMapUserPost[];
  avatarUrl?: string;
};

const DEFAULT_STATUS = '正在浏览活动';

const POSTS_BY_MARKER_NAME: Record<string, EventMapUserPost[]> = {
  Bianca: [
    {
      id: 'bianca-1',
      contentTypes: ['team'],
      location: '深圳',
      timeLabel: '4小时前',
      body: '6月13日STORM A区，4缺2女生，有想一起的来！超级期待🔥',
      likes: 21,
      comments: 9,
    },
    {
      id: 'bianca-2',
      contentTypes: ['carpool'],
      location: '深圳',
      timeLabel: '12小时前',
      body: '深圳到上海 6/15 高铁 2人，可以拼帮带东西吗哈哈',
      likes: 1,
      comments: 3,
    },
  ],
  Jestin: [
    {
      id: 'jestin-1',
      contentTypes: ['team'],
      location: '深圳',
      timeLabel: '1天前',
      body: '有没有小伙伴一起冲风暴电音节 Day1 的票？我们 3 缺 1，性格好相处的来～',
      likes: 12,
      comments: 3,
    },
  ],
  Christopher: [
    {
      id: 'chris-1',
      contentTypes: ['carpool'],
      location: '深圳',
      timeLabel: '2天前',
      body: '福田出发，可拼 2 位，顺路接送。',
      likes: 8,
      comments: 2,
    },
  ],
  Luna: [
    {
      id: 'luna-1',
      contentTypes: ['accommodation'],
      location: '深圳',
      timeLabel: '3小时前',
      body: '会场附近酒店已订，女生房还可拼一位。',
      likes: 6,
      comments: 0,
    },
  ],
  Ariel: [
    {
      id: 'ariel-1',
      contentTypes: ['team'],
      location: '深圳',
      timeLabel: '刚刚',
      body: '已组队成功，评论区可约集合时间。',
      likes: 3,
      comments: 6,
    },
  ],
};

const DISPLAY_OVERRIDES: Record<
  string,
  { displayName?: string; emoji?: string; statusText?: string }
> = {
  Bianca: { displayName: '晓晓爱嗨' },
  Jestin: { displayName: 'Justin', emoji: '🏄' },
};

export function mapEventDetailPostToEventMapUserPost(
  post: EventDetailPost,
  formatTime: (iso: string) => string,
): EventMapUserPost {
  const timeLabel = post.createdAt ? formatTime(post.createdAt) : '';

  return {
    id: post.id,
    contentTypes: post.contentTypes,
    location: post.location,
    timeLabel,
    body: post.body,
    images: post.images,
    likes: post.likes,
    comments: post.comments,
  };
}

export function mapProfilePostToEventMapUserPost(
  item: ProfilePostItem,
): EventMapUserPost {
  return {
    id: item.id,
    contentTypes: item.contentTypes,
    location: item.title?.trim() || '',
    timeLabel: item.date,
    body: item.content,
    images: item.images,
    likes: item.likes,
    comments: item.comments,
  };
}

export function buildEventMapUserSheetData(
  marker: EventMapMarker,
  posts: EventMapUserPost[],
  options?: {
    profile?: ProfileSummary | null;
    authorDisplayName?: string;
    authorAvatar?: string;
  },
): EventMapUserSheetData {
  const override = DISPLAY_OVERRIDES[marker.name];
  const statusText = override?.statusText ?? marker.badge ?? DEFAULT_STATUS;

  const displayName =
    override?.displayName ??
    options?.authorDisplayName?.trim() ??
    options?.profile?.name?.trim() ??
    marker.shortName ??
    marker.name;

  const avatarUrl =
    options?.authorAvatar?.trim() || options?.profile?.avatar?.trim() || undefined;

  return {
    displayName,
    emoji: override?.emoji,
    statusText,
    posts,
    avatarUrl,
  };
}

/** 无 API 时的本地演示数据 */
export function getEventMapUserSheetMockData(
  marker: EventMapMarker,
): EventMapUserSheetData {
  return buildEventMapUserSheetData(marker, POSTS_BY_MARKER_NAME[marker.name] ?? []);
}
