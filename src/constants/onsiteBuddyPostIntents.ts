import type { AiBuddyPostFormValues, BuddyPostTagId } from '../types/buddyPost';
import { defaultBuddyPostForm } from '../utils/buddyPostForm';
import { eventCityFromLocation } from '../utils/travelGuideDepartureSuggestions';
import { BUDDY_POST_TAG_OPTIONS } from '../types/buddyPost';

export type OnsiteBuddyPostIntentId =
  | 'onsite_team'
  | 'onsite_carpool_stage'
  | 'onsite_carpool'
  | 'onsite_accommodation';

export type OnsiteBuddyPostIntent = {
  id: OnsiteBuddyPostIntentId;
  label: string;
};

export const ONSITE_BUDDY_POST_INTENTS: OnsiteBuddyPostIntent[] = [
  { id: 'onsite_team', label: '现场找队友' },
  { id: 'onsite_carpool_stage', label: '主舞台附近拼车' },
  { id: 'onsite_carpool', label: '散场拼车' },
  { id: 'onsite_accommodation', label: '现场拼房' },
];

function todayIsoLocal(now: Date): string {
  const y = now.getFullYear();
  const m = String(now.getMonth() + 1).padStart(2, '0');
  const d = String(now.getDate()).padStart(2, '0');
  return `${y}-${m}-${d}`;
}

const INTENT_PRESETS: Record<
  OnsiteBuddyPostIntentId,
  { tags: BuddyPostTagId[]; note: string }
> = {
  onsite_team: {
    tags: ['team'],
    note: '主舞台/现场附近找队友',
  },
  onsite_carpool_stage: {
    tags: ['carpool', 'team'],
    note: '现在在主舞台附近找拼车',
  },
  onsite_carpool: {
    tags: ['carpool', 'team'],
    note: '散场拼车回酒店/市区',
  },
  onsite_accommodation: {
    tags: ['accommodation'],
    note: '现场拼房/当晚住宿',
  },
};

export function buildOnsiteBuddyPostForm(
  intentId: OnsiteBuddyPostIntentId,
  activityDate?: string,
  activityLocation?: string,
  now = new Date(),
): AiBuddyPostFormValues | null {
  const base = defaultBuddyPostForm(activityDate);
  if (!base) return null;

  const preset = INTENT_PRESETS[intentId];
  const location = eventCityFromLocation(activityLocation) ?? '现场';
  const today = todayIsoLocal(now);

  return {
    ...base,
    dateStart: today,
    dateEnd: today,
    location,
    headcount: base.headcount || '',
    tags: preset.tags,
    note: preset.note,
  };
}

export function formatOnsiteIntentTagLabels(form: AiBuddyPostFormValues): string {
  return form.tags
    .map((id) => BUDDY_POST_TAG_OPTIONS.find((o) => o.id === id)?.label ?? id)
    .join('、');
}

/** Summary lines for buddy sheet prefill banner (chip → sheet → confirm). */
export function buildOnsiteIntentPrefillSummaryLines(
  intentId: OnsiteBuddyPostIntentId,
  form: AiBuddyPostFormValues,
): string[] {
  const intentLabel =
    ONSITE_BUDDY_POST_INTENTS.find((item) => item.id === intentId)?.label ?? '现场招募';
  const tagLabels = formatOnsiteIntentTagLabels(form);
  const lines = [intentLabel, form.location.trim() || '现场', tagLabels];
  if (form.note?.trim()) {
    lines.push(form.note.trim());
  }
  return lines;
}

export const ONSITE_INTENT_PREFILL_BANNER_TITLE = '现场快捷发帖 · 已预填';

export const ONSITE_INTENT_ONSITE_BADGE_HINT =
  '若今日已完成手环认证，发布后将显示「我在现场」标识';

/** @deprecated Prefer sheet prefill; kept for quick modal copy if needed. */
export function formatOnsiteIntentModalContent(form: AiBuddyPostFormValues): string {
  const tagLabels = formatOnsiteIntentTagLabels(form);
  const lines = [
    `地点：${form.location.trim() || '现场'}`,
    `类型：${tagLabels}`,
    form.note?.trim() ? `备注：${form.note.trim()}` : '',
  ].filter(Boolean);
  return lines.join('\n');
}
