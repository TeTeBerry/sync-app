import type { PostContentType } from '../types/backend';
import type { AiBuddyPostFormValues, BuddyPostTagId } from '../types/buddyPost';
import { BUDDY_POST_TAG_OPTIONS } from '../types/buddyPost';
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

function buddyPostIntentPhrases(tags: BuddyPostTagId[]): string {
  const phrases = BUDDY_POST_TAG_OPTIONS.filter((opt) => tags.includes(opt.id)).map(
    (opt) => opt.intentPhrase,
  );
  return phrases.length ? phrases.join('、') : '找队友';
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

/** 帖子正文：找队友，6.13-6.14，上海，2人（多类型则「找队友、找拼房，…」） */
export function buildBuddyPostBody(form: AiBuddyPostFormValues): string {
  const parts = [
    buddyPostIntentPhrases(form.tags),
    formatBuddyPostDateShort(form.dateStart, form.dateEnd),
    form.location.trim(),
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

export function buddyPostContentTypes(tags: BuddyPostTagId[]): PostContentType[] {
  const types = new Set<PostContentType>();
  for (const id of tags) {
    const opt = BUDDY_POST_TAG_OPTIONS.find((o) => o.id === id);
    if (opt) types.add(opt.contentType);
  }
  if (!types.size) types.add('team');
  return [...types];
}

export function buildBuddyPostUserSummary(
  form: AiBuddyPostFormValues,
  activityTitle: string,
): string {
  const title = activityTitle.trim() || '活动';
  return `发布「${title}」组队帖 · ${buildBuddyPostBody(form)}`;
}
