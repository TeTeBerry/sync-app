import type { PostContentType } from '../types/backend';
import type { AiBuddyPostFormValues, BuddyPostTagId } from '../types/buddyPost';
import { BUDDY_POST_TAG_OPTIONS } from '../types/buddyPost';
import {
  boundsToIsoDate,
  formatBuddyPostDateRange,
  parseActivityDateBounds,
} from './activityDateBounds';

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

export function buildBuddyPostBody(
  form: AiBuddyPostFormValues,
  activityTitle: string,
): string {
  const timeLabel = formatBuddyPostDateRange(form.dateStart, form.dateEnd);
  const lines = [
    `找「${activityTitle.trim() || '活动'}」同行`,
    `时间：${timeLabel}`,
    `地点：${form.location.trim()}`,
    `人数：${form.headcount.trim()}`,
  ];

  const tagLabels = form.tags
    .map((id) => BUDDY_POST_TAG_OPTIONS.find((o) => o.id === id)?.hashTag)
    .filter(Boolean);
  if (tagLabels.length) {
    lines.push(`类型：${tagLabels.join(' ')}`);
  }

  const note = form.note?.trim();
  if (note) {
    lines.push(`备注：${note}`);
  }

  return lines.join('\n');
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
  const tagText = form.tags
    .map((id) => BUDDY_POST_TAG_OPTIONS.find((o) => o.id === id)?.label)
    .filter(Boolean)
    .join('、');
  const time = formatBuddyPostDateRange(form.dateStart, form.dateEnd);
  const parts = [
    `发布「${activityTitle}」组队帖`,
    time,
    form.location.trim(),
    form.headcount.trim(),
  ];
  if (tagText) parts.push(tagText);
  return parts.filter(Boolean).join(' · ');
}
