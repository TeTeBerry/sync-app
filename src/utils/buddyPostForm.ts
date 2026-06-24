import type { AiBuddyPostFormValues, BuddyPostTagId } from '../types/buddyPost';
import { BUDDY_POST_TAG_OPTIONS } from '../types/buddyPost';
import { parseBuddyPostRecruitDisplay } from '../domains/partner-feed/utils/parseBuddyPostRecruitDisplay';
import {
  boundsToIsoDate,
  formatBuddyPostDateShort,
  parseActivityDateBounds,
} from './activityDateBounds';

export function formatBuddyPostHeadcount(raw: string): string {
  const trimmed = raw.trim();
  if (!trimmed) return trimmed;
  if (/人$/.test(trimmed)) return trimmed;
  return `${trimmed}人`;
}

/** 发帖正文/地点字段展示用：上海 → 上海出发 */
export function formatBuddyPostDeparture(raw: string): string {
  const trimmed = raw.trim();
  if (!trimmed) return '';
  return trimmed.endsWith('出发') ? trimmed : `${trimmed}出发`;
}

/** 编辑回填表单时去掉尾部「出发」 */
export function stripBuddyPostDepartureSuffix(raw: string): string {
  const trimmed = raw.trim();
  if (!trimmed) return '';
  return trimmed.endsWith('出发') ? trimmed.slice(0, -2) : trimmed;
}

function buddyPostIntentPhrases(tags: BuddyPostTagId[]): string {
  const phrases = BUDDY_POST_TAG_OPTIONS.filter((opt) => tags.includes(opt.id)).map(
    (opt) => opt.intentPhrase,
  );
  return phrases.length ? phrases.join('、') : '组队';
}

export function defaultBuddyPostForm(
  activityDate?: string,
): AiBuddyPostFormValues | null {
  const bounds = parseActivityDateBounds(activityDate);
  if (!bounds) return null;
  const dateStart = boundsToIsoDate(bounds, bounds.dayStart);
  const dateEnd = boundsToIsoDate(bounds, bounds.dayEnd);
  return {
    dateStart,
    dateEnd,
    location: '',
    headcount: '',
    tags: ['team'],
    note: '',
  };
}

export function defaultBuddyPostFormWithTag(
  _tagId: BuddyPostTagId = 'team',
  activityDate?: string,
): AiBuddyPostFormValues | null {
  const base = defaultBuddyPostForm(activityDate);
  if (!base) return null;
  return { ...base, tags: ['team'] };
}

/** 帖子正文：组队，6.13-6.14，上海，2人 */
export function buildBuddyPostBody(form: AiBuddyPostFormValues): string {
  const parts = [
    buddyPostIntentPhrases(form.tags),
    formatBuddyPostDateShort(form.dateStart, form.dateEnd),
    formatBuddyPostDeparture(form.location),
    formatBuddyPostHeadcount(form.headcount),
  ].filter(Boolean);

  const note = form.note?.trim();
  if (note) {
    parts.push(note);
  }

  return parts.join('，');
}

export function buddyPostHashTags(tags: BuddyPostTagId[]): string[] {
  const out = new Set<string>();
  for (const id of tags) {
    const opt = BUDDY_POST_TAG_OPTIONS.find((o) => o.id === id);
    if (opt) out.add(opt.hashTag);
  }
  return [...out];
}

export function buildBuddyPostUserSummary(
  form: AiBuddyPostFormValues,
  activityTitle: string,
): string {
  const title = activityTitle.trim() || '活动';
  return `发布「${title}」组队帖 · ${buildBuddyPostBody(form)}`;
}

export function buildRecruitFieldsFromBuddyForm(form: AiBuddyPostFormValues): {
  recruitStatus: 'open' | 'full';
  slotsTotal?: number;
  slotsFilled?: number;
} {
  const parsed = parseBuddyPostRecruitDisplay(form.headcount.trim());
  return {
    recruitStatus: 'open',
    ...(parsed.slotsTotal != null ? { slotsTotal: parsed.slotsTotal } : {}),
    ...(parsed.slotsFilled != null ? { slotsFilled: parsed.slotsFilled } : {}),
  };
}
