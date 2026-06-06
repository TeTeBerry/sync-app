import { ACTIVITY_TYPE_LABELS, getActivityTypeLabel } from '../constants/activityType';

const KNOWN_LABELS = new Set<string>(Object.values(ACTIVITY_TYPE_LABELS));

/** Display label for home / event category chips (activity type, not hot-based). */
export function formatActivityCategoryLabel(category?: string): string {
  const normalized = category?.trim();
  if (!normalized) return '电音节';
  if (KNOWN_LABELS.has(normalized)) return normalized;
  // Legacy API values before activityType rollout
  if (normalized === 'EDM节' || normalized === '户外电音' || normalized === 'EDM') {
    return '电音节';
  }
  if (normalized === 'festival' || normalized === 'indoor') {
    return getActivityTypeLabel(normalized);
  }
  return normalized;
}
