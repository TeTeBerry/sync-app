import type { AiBuddyPostFormValues, BuddyPostTagId } from '../types/buddyPost';
import { BUDDY_POST_TAG_OPTIONS } from '../types/buddyPost';
import { boundsToIsoDate, parseActivityDateBounds } from './activityDateBounds';
import { isBuddyPostIntent } from './buddyPostIntent';
import { isTravelGuideIntent } from './travelGuideIntent';

export type BuddyPostSlotKey = 'dateRange' | 'location' | 'headcount';

export type BuddyPostChatDraft = Partial<
  Pick<
    AiBuddyPostFormValues,
    'dateStart' | 'dateEnd' | 'location' | 'headcount' | 'tags' | 'note'
  >
>;

export function mergeBuddyPostDraft(
  base: BuddyPostChatDraft,
  patch: BuddyPostChatDraft,
): BuddyPostChatDraft {
  return {
    ...base,
    ...patch,
    dateStart: patch.dateStart?.trim() || base.dateStart,
    dateEnd: patch.dateEnd?.trim() || base.dateEnd,
    location: patch.location?.trim() || base.location,
    headcount: patch.headcount?.trim() || base.headcount,
    tags: patch.tags?.length ? patch.tags : base.tags,
    note: patch.note?.trim() || base.note,
  };
}

export function listMissingBuddyPostSlots(
  draft: BuddyPostChatDraft,
): BuddyPostSlotKey[] {
  const missing: BuddyPostSlotKey[] = [];
  if (!draft.dateStart?.trim() || !draft.dateEnd?.trim()) {
    missing.push('dateRange');
  }
  if (!draft.location?.trim()) missing.push('location');
  if (!draft.headcount?.trim()) missing.push('headcount');
  return missing;
}

export function buddyPostDraftToForm(
  draft: BuddyPostChatDraft,
): AiBuddyPostFormValues | null {
  if (listMissingBuddyPostSlots(draft).length > 0) return null;
  return {
    dateStart: draft.dateStart!.trim(),
    dateEnd: draft.dateEnd!.trim(),
    location: draft.location!.trim(),
    headcount: draft.headcount!.trim(),
    tags: draft.tags?.length ? draft.tags : ['team'],
    note: draft.note?.trim() || undefined,
  };
}

export function buildBuddyPostCollectPrompt(missing: BuddyPostSlotKey[]): string {
  const parts: string[] = [];
  if (missing.includes('dateRange')) {
    parts.push('时间（如 6.13-6.14 或 6月13日-14日）');
  }
  if (missing.includes('location')) parts.push('地点/出发地（如 上海、A区）');
  if (missing.includes('headcount')) parts.push('人数（如 2人）');
  const lines = [
    '好的，我来帮你发布组队帖。',
    '',
    `请补充：${parts.join('、')}。`,
    '也可一句话说全，例如：「6.13-6.14 上海 2人 拼房」。',
    '若需表单填写，可点下方「组队发帖」按钮。',
  ];
  return lines.join('\n');
}

export function buildBuddyPostSuggestedReplies(missing: BuddyPostSlotKey[]): string[] {
  if (missing.length === 1 && missing[0] === 'headcount') {
    return ['2人', '3人', '4人'];
  }
  if (missing.length === 1 && missing[0] === 'location') {
    return ['上海', '广州', 'A区'];
  }
  if (missing.length === 1 && missing[0] === 'dateRange') {
    return ['6.13-6.14', '6月13日', '13-14号'];
  }
  return ['6.13-6.14 上海 2人 拼房', '13号 A区 3人 组队', '6.14 广州 2人 拼车'];
}

export function parseBuddyPostChatMessage(
  text: string,
  activityDate?: string,
): BuddyPostChatDraft {
  const raw = text.trim();
  if (!raw) return {};

  const draft: BuddyPostChatDraft = {};
  const bounds = parseActivityDateBounds(activityDate);
  const year = bounds?.year ?? new Date().getFullYear();

  const range = parseDateRange(raw, year, bounds?.month);
  if (range) {
    draft.dateStart = range.start;
    draft.dateEnd = range.end;
  }

  const headcount = parseHeadcountText(raw);
  if (headcount) draft.headcount = headcount;

  const location = parseLocation(raw);
  if (location) draft.location = location;

  const tags = parseBuddyTags(raw);
  if (tags.length) draft.tags = tags;

  const note = parseNote(raw);
  if (note) draft.note = note;

  return draft;
}

function parseDateRange(
  text: string,
  year: number,
  hintMonth?: number,
): { start: string; end: string } | null {
  const m1 = text.match(/(\d{1,2})[./月](\d{1,2})\s*[-–~至]\s*(\d{1,2})(?:[日号])?/);
  if (m1) {
    const month = Number(m1[1]);
    const dayStart = Number(m1[2]);
    const dayEnd = Number(m1[3]);
    if (month >= 1 && month <= 12 && dayStart >= 1 && dayEnd >= dayStart) {
      const b = { year, month, dayStart, dayEnd };
      return {
        start: boundsToIsoDate(b, dayStart),
        end: boundsToIsoDate(b, dayEnd),
      };
    }
  }

  const m2 = text.match(/(\d{1,2})[./月](\d{1,2})[日号]?/);
  if (m2) {
    const month = Number(m2[1]);
    const day = Number(m2[2]);
    if (month >= 1 && month <= 12 && day >= 1) {
      const b = { year, month, dayStart: day, dayEnd: day };
      const iso = boundsToIsoDate(b, day);
      return { start: iso, end: iso };
    }
  }

  const m3 = text.match(/(\d{1,2})\s*[-–~至]\s*(\d{1,2})\s*[日号]?/);
  if (m3 && hintMonth) {
    const dayStart = Number(m3[1]);
    const dayEnd = Number(m3[2]);
    if (dayStart >= 1 && dayEnd >= dayStart) {
      const b = { year, month: hintMonth, dayStart, dayEnd };
      return {
        start: boundsToIsoDate(b, dayStart),
        end: boundsToIsoDate(b, dayEnd),
      };
    }
  }

  return null;
}

function parseHeadcountText(text: string): string | undefined {
  const m = text.match(/(\d+)\s*[-–~至]\s*(\d+)\s*人/);
  if (m) return `${m[1]}-${m[2]}人`;
  const single = text.match(/(\d+)\s*人/);
  if (single) return `${single[1]}人`;
  return undefined;
}

const CITIES = [
  '上海',
  '北京',
  '广州',
  '深圳',
  '杭州',
  '成都',
  '武汉',
  '南京',
  '重庆',
  '西安',
  '苏州',
  '珠海',
] as const;

function parseLocation(text: string): string | undefined {
  const zone = text.match(/([A-Za-z])\s*区/);
  if (zone) return `${zone[1].toUpperCase()}区`;

  const from = text.match(/(?:从|在)\s*([^，,。；;\s]{2,8})/);
  if (from?.[1] && !/(帮我|组队|发帖)/.test(from[1])) {
    return from[1].trim();
  }

  for (const city of CITIES) {
    if (text.includes(city)) return city;
  }

  return undefined;
}

function parseBuddyTags(text: string): BuddyPostTagId[] {
  const found = new Set<BuddyPostTagId>();
  for (const opt of BUDDY_POST_TAG_OPTIONS) {
    if (text.includes(opt.label) || text.includes(opt.hashTag.replace('#', ''))) {
      found.add(opt.id);
    }
  }
  if (/组队队友|找队友|求组队/.test(text)) found.add('team');
  if (/住宿同行/.test(text)) found.add('accommodation');
  return [...found];
}

function parseNote(text: string): string | undefined {
  const m = text.match(/备注[:：]\s*(.+)$/);
  return m?.[1]?.trim() || undefined;
}

const TRAVEL_EXCLUSIVE =
  /攻略|规划行程|出行攻略|舒适|豪华|经济|自驾|不自驾|住\s*\d+\s*晚|预算/;

export function shouldHandleAsBuddyPostChat(input: {
  text: string;
  collecting: boolean;
  activityDate?: string;
}): boolean {
  const trimmed = input.text.trim();
  if (!trimmed) return false;
  if (input.collecting) return true;
  if (isTravelGuideIntent(trimmed)) return false;
  if (TRAVEL_EXCLUSIVE.test(trimmed) && !isBuddyPostIntent(trimmed)) {
    return false;
  }
  if (isBuddyPostIntent(trimmed)) return true;

  const slots = parseBuddyPostChatMessage(trimmed, input.activityDate);
  const hasDate = Boolean(slots.dateStart && slots.dateEnd);
  const hasBuddySignal =
    hasDate ||
    Boolean(slots.tags?.length) ||
    /[A-Za-z]\s*区/.test(trimmed) ||
    /拼房|拼车|拼卡|组队/.test(trimmed);

  if (!hasBuddySignal) return false;

  if (slots.headcount && slots.location && hasDate) return true;
  if (hasDate && (slots.headcount || slots.location)) return true;
  if (slots.tags?.length && (hasDate || slots.headcount || slots.location)) {
    return true;
  }

  return false;
}

export function isBuddyPostChatInterrupt(text: string): boolean {
  const trimmed = text.trim();
  if (!trimmed) return false;
  if (isTravelGuideIntent(trimmed)) return true;
  if (/生成.*攻略|出行攻略/.test(trimmed)) return true;
  return false;
}
