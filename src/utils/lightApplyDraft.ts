import type { TeamApplyBuddyPreview } from './teamApplyBuddyPreview';

export type LightApplyGenderPref = '女生优先' | '男生优先' | '不限';

export type LightApplyDraft = {
  departureCity: string;
  tripDays?: number;
  genderPref?: LightApplyGenderPref;
};

export const LIGHT_APPLY_GENDER_OPTIONS: LightApplyGenderPref[] = [
  '不限',
  '女生优先',
  '男生优先',
];

export const LIGHT_APPLY_TRIP_DAY_OPTIONS: Array<{
  label: string;
  value?: number;
}> = [
  { label: '1天', value: 1 },
  { label: '2天', value: 2 },
  { label: '3天', value: 3 },
  { label: '全程', value: undefined },
];

export function formatLightApplyBody(draft: LightApplyDraft): string {
  const parts = [`从${draft.departureCity.trim()}出发`];
  if (draft.tripDays != null) {
    parts.push(`活动 ${draft.tripDays} 天`);
  }
  if (draft.genderPref && draft.genderPref !== '不限') {
    parts.push(draft.genderPref);
  }
  return parts.join('，');
}

export function buildLightApplyMessage(draft: LightApplyDraft, note?: string): string {
  const base = formatLightApplyBody(draft);
  const trimmed = note?.trim();
  if (!trimmed) return base;
  return `${base}；补充：${trimmed}`;
}

export function lightApplyToBuddyPreview(
  draft: LightApplyDraft,
): TeamApplyBuddyPreview {
  return {
    body: formatLightApplyBody(draft),
    location: draft.departureCity.trim(),
    tags: ['#组队'],
  };
}

export function defaultLightApplyDraft(prefill?: {
  departureCity?: string;
}): LightApplyDraft {
  return {
    departureCity: prefill?.departureCity?.trim() ?? '',
    tripDays: undefined,
    genderPref: '不限',
  };
}
