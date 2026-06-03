import type { AiBuddyPostFormValues, BuddyPostTagId } from '../types/buddyPost';
import { BUDDY_POST_TAG_OPTIONS } from '../types/buddyPost';
import {
  boundsToIsoDate,
  formatBuddyPostDateShort,
  parseActivityDateBounds,
} from './activityDateBounds';
import { isBuddyPostIntent } from './buddyPostIntent';
import { isTravelGuideIntent } from './travelGuideIntent';

export type BuddyPostSlotKey = 'dateRange' | 'location' | 'headcount';

/** Activity context for dynamic collect prompts and suggested reply chips. */
export type BuddyPostSuggestContext = {
  activityDate?: string;
  activityLocation?: string;
};

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

function inferCityFromActivityText(text?: string): string | undefined {
  const haystack = text?.trim();
  if (!haystack) return undefined;
  for (const city of CITIES) {
    if (haystack.includes(city)) return city;
  }
  return undefined;
}

function resolveBuddySuggestDefaults(ctx?: BuddyPostSuggestContext) {
  const bounds = parseActivityDateBounds(ctx?.activityDate);
  const city =
    inferCityFromActivityText(ctx?.activityLocation) ??
    inferCityFromActivityText(ctx?.activityDate) ??
    '上海';

  const altCities = CITIES.filter((c) => c !== city);
  const cityB = altCities[0] ?? '广州';
  const cityC = altCities[1] ?? '北京';

  let dateShort = '6.13-6.14';
  let dateMonthLabel = '6月13日';
  let dayOnlyRange = '13-14号';
  let dayStartLabel = '13号';

  if (bounds) {
    const startIso = boundsToIsoDate(bounds, bounds.dayStart);
    const endIso = boundsToIsoDate(bounds, bounds.dayEnd);
    dateShort = formatBuddyPostDateShort(startIso, endIso);
    dateMonthLabel = `${bounds.month}月${bounds.dayStart}日`;
    dayOnlyRange =
      bounds.dayStart === bounds.dayEnd
        ? `${bounds.dayStart}号`
        : `${bounds.dayStart}-${bounds.dayEnd}号`;
    dayStartLabel = `${bounds.dayStart}号`;
  }

  return {
    bounds,
    city,
    cityB,
    cityC,
    dateShort,
    dateMonthLabel,
    dayOnlyRange,
    dayStartLabel,
  };
}

function buildBuddyOneLiner(
  dateLabel: string,
  city: string,
  headcount: string,
  intent: '拼房' | '组队' | '拼车',
): string {
  return `${dateLabel} ${city} ${headcount} ${intent}`;
}

export function buildBuddyPostCollectPrompt(
  missing: BuddyPostSlotKey[],
  ctx?: BuddyPostSuggestContext,
): string {
  const defaults = resolveBuddySuggestDefaults(ctx);
  const parts: string[] = [];
  if (missing.includes('dateRange')) {
    const dateHint = defaults.bounds
      ? `时间（如 ${defaults.dateShort} 或 ${defaults.dateMonthLabel}-${defaults.bounds.dayEnd}日）`
      : `时间（如 ${defaults.dateShort} 或 6月13日-14日）`;
    parts.push(dateHint);
  }
  if (missing.includes('location')) {
    parts.push(`地点/出发地（如 ${defaults.city}、A区）`);
  }
  if (missing.includes('headcount')) parts.push('人数（如 2人）');

  const example = buildBuddyOneLiner(defaults.dateShort, defaults.city, '2人', '拼房');

  const lines = [
    '好的，我来帮你发布组队帖。',
    '',
    `请补充：${parts.join('、')}。`,
    `也可一句话说全，例如：「${example}」。`,
    '若需表单填写，可点下方「组队发帖」按钮。',
  ];
  return lines.join('\n');
}

export function buildBuddyPostSuggestedReplies(
  missing: BuddyPostSlotKey[],
  ctx?: BuddyPostSuggestContext,
): string[] {
  const d = resolveBuddySuggestDefaults(ctx);

  if (missing.length === 1 && missing[0] === 'headcount') {
    return ['2人', '3人', '4人'];
  }
  if (missing.length === 1 && missing[0] === 'location') {
    return [d.city, d.cityB, 'A区'];
  }
  if (missing.length === 1 && missing[0] === 'dateRange') {
    return [d.dateShort, d.dateMonthLabel, d.dayOnlyRange];
  }

  const primary = buildBuddyOneLiner(d.dateShort, d.city, '2人', '拼房');
  const teamLine = `${d.dayStartLabel} A区 3人 组队`;
  const carpoolDate =
    d.bounds && d.bounds.dayEnd !== d.bounds.dayStart
      ? `${d.bounds.month}.${d.bounds.dayEnd}`
      : d.dateShort;
  const carpool = buildBuddyOneLiner(carpoolDate, d.cityB, '2人', '拼车');

  return [primary, teamLine, carpool];
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
  // 6.13-6.14 / 6/13-6/14 — month.day to month.day (must run before same-month patterns)
  const crossMonth = text.match(
    /(\d{1,2})[./](\d{1,2})\s*[-–~至]\s*(\d{1,2})[./](\d{1,2})/,
  );
  if (crossMonth) {
    const monthStart = Number(crossMonth[1]);
    const dayStart = Number(crossMonth[2]);
    const monthEnd = Number(crossMonth[3]);
    const dayEnd = Number(crossMonth[4]);
    if (
      monthStart >= 1 &&
      monthStart <= 12 &&
      monthEnd >= 1 &&
      monthEnd <= 12 &&
      dayStart >= 1 &&
      dayEnd >= 1
    ) {
      const start = boundsToIsoDate(
        { year, month: monthStart, dayStart, dayEnd: dayStart },
        dayStart,
      );
      const end = boundsToIsoDate(
        { year, month: monthEnd, dayStart: dayEnd, dayEnd },
        dayEnd,
      );
      if (start <= end) {
        return { start, end };
      }
    }
  }

  // 6.13-14 / 6月13-14日 — same month, end is day-only (not 6.14)
  const sameMonth = text.match(
    /(\d{1,2})[./月](\d{1,2})\s*[-–~至]\s*(\d{1,2})(?:[日号])?(?!\s*[./月])/,
  );
  if (sameMonth) {
    const month = Number(sameMonth[1]);
    const dayStart = Number(sameMonth[2]);
    const dayEnd = Number(sameMonth[3]);
    if (month >= 1 && month <= 12 && dayStart >= 1 && dayEnd >= dayStart) {
      const b = { year, month, dayStart, dayEnd };
      return {
        start: boundsToIsoDate(b, dayStart),
        end: boundsToIsoDate(b, dayEnd),
      };
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

  const singleDay = text.match(/(\d{1,2})[./月](\d{1,2})[日号]?/);
  if (singleDay) {
    const month = Number(singleDay[1]);
    const day = Number(singleDay[2]);
    if (month >= 1 && month <= 12 && day >= 1) {
      const b = { year, month, dayStart: day, dayEnd: day };
      const iso = boundsToIsoDate(b, day);
      return { start: iso, end: iso };
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
