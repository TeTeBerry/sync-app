import type { CurrentUser } from '../types/backend';

/** Common departure cities for chip picker. */
export const MATCH_DEPARTURE_CITIES = [
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
  '芭提雅',
  '普吉岛',
] as const;

/** Curated genres for multi-select (aligned with backend profile normalization). */
export const MATCH_GENRE_OPTIONS = [
  'House',
  'Techno',
  'Trance',
  'Tech House',
  'Dubstep',
  'Drum and Bass',
  'Psytrance',
  'Hardstyle',
  'Future Bass',
  'Melodic Techno',
  'Progressive House',
  'Big Room',
] as const;

export type MatchBudgetLevel = 'low' | 'medium' | 'high';

export const MATCH_BUDGET_OPTIONS: Array<{
  id: MatchBudgetLevel;
  label: string;
  hint: string;
}> = [
  { id: 'low', label: '经济', hint: '精打细算' },
  { id: 'medium', label: '舒适', hint: '性价比' },
  { id: 'high', label: '充裕', hint: '品质优先' },
];

export function normalizeMatchBudgetLevel(raw?: string): MatchBudgetLevel | undefined {
  const value = raw?.trim().toLowerCase();
  if (value === 'low' || value === 'medium' || value === 'high') return value;
  if (/低|经济/.test(raw ?? '')) return 'low';
  if (/高|豪华/.test(raw ?? '')) return 'high';
  if (/中|舒适/.test(raw ?? '')) return 'medium';
  return undefined;
}

export function matchBudgetLabel(level?: string): string {
  const normalized = normalizeMatchBudgetLevel(level);
  const opt = MATCH_BUDGET_OPTIONS.find((o) => o.id === normalized);
  return opt ? opt.label : level?.trim() || '';
}

export function formatMatchPreferencesSummary(
  user?: Pick<CurrentUser, 'city' | 'favorGenres' | 'budgetLevel' | 'likeMate'> | null,
): string {
  if (!user) return '未设置';
  const parts: string[] = [];
  if (user.city?.trim()) parts.push(user.city.trim());
  if (user.favorGenres?.length) {
    const genres = user.favorGenres.slice(0, 2).join('、');
    const more = user.favorGenres.length > 2 ? `等${user.favorGenres.length}种` : '';
    parts.push(`${genres}${more}`);
  }
  const budget = matchBudgetLabel(user.budgetLevel);
  if (budget) parts.push(budget);
  if (user.likeMate === true) parts.push('找搭子');
  return parts.length ? parts.join(' · ') : '未设置';
}
