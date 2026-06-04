import {
  CONTENT_TYPE_STYLE_KEYS,
  resolveContentTypeKey,
} from './postContentTypeDisplay';

/** CSS modifier keys on `.s-content-badge--*`. */
export type PostTagStyleKey =
  | 'team'
  | 'accommodation'
  | 'carpool'
  | 'ticket'
  | 'groupbuy'
  | 'other'
  | 'status-full'
  | 'status-done'
  | 'gender-f'
  | 'gender-m'
  | 'zone'
  | 'location'
  | 'ticket-extra'
  | 'date'
  | 'hint';

const STATUS_TAGS: Record<string, PostTagStyleKey> = {
  已满: 'status-full',
  组队完成: 'status-done',
};

const TICKET_EXTRA_TAGS = new Set(['折价', 'VIP', 'Stage', 'ASOT', '出票', '票务']);

const LOCATION_CITY_HINTS = [
  '香港',
  '澳门',
  '台湾',
  '上海',
  '北京',
  '广州',
  '深圳',
  '成都',
  '杭州',
  '武汉',
  '南京',
  '重庆',
  '西安',
  '苏州',
  '珠海',
];

function normalizeTagLabel(tag: string): string {
  return tag.trim().replace(/^#/, '');
}

export function formatPostTagLabel(tag: string): string {
  const raw = tag.trim();
  if (!raw) return '';
  return raw.startsWith('#') ? raw : `#${raw}`;
}

export function resolvePostTagStyleKey(tag: string): PostTagStyleKey {
  const label = normalizeTagLabel(tag);
  if (!label) return 'hint';

  const contentKey = resolveContentTypeKey(tag);
  if (CONTENT_TYPE_STYLE_KEYS.has(contentKey)) {
    return contentKey as PostTagStyleKey;
  }

  if (STATUS_TAGS[label]) return STATUS_TAGS[label];

  if (/女生|姐妹|妹子|小姐姐/.test(label)) return 'gender-f';
  if (/男生|兄弟|老哥/.test(label)) return 'gender-m';

  if (/区$/.test(label) || /^\d+号/.test(label)) return 'zone';

  if (TICKET_EXTRA_TAGS.has(label)) return 'ticket-extra';

  if (/^\d{1,2}\.\d{1,2}$/.test(label)) return 'date';

  if (
    label.endsWith('出发') ||
    LOCATION_CITY_HINTS.some((city) => label.includes(city))
  ) {
    return 'location';
  }

  return 'hint';
}

export function postTagBadgeClass(tag: string): string {
  const key = resolvePostTagStyleKey(tag);
  return `s-content-badge s-content-badge--${key}`;
}
