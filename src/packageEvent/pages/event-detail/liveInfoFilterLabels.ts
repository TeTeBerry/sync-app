import type { LiveInfoFeedFilters, LiveInfoZone } from '../../../types/backend';
import { getLiveInfoCategory, type LiveInfoCategoryId } from './liveInfoConfig';

export function isLiveInfoFilterActive(filters: LiveInfoFeedFilters): boolean {
  return Boolean(
    filters.zoneTag?.trim() || filters.categoryId || filters.certifiedOnly,
  );
}

export function buildLiveInfoFilterSubtitle(
  filters: LiveInfoFeedFilters,
  zones: LiveInfoZone[],
): string | undefined {
  const parts: string[] = [];
  const zoneId = filters.zoneTag?.trim();
  if (zoneId) {
    const label =
      zones.find((z) => z.id === zoneId)?.label ??
      (zoneId === 'venue' ? '全场' : zoneId);
    parts.push(label);
  }
  if (filters.categoryId) {
    parts.push(getLiveInfoCategory(filters.categoryId as LiveInfoCategoryId).label);
  }
  if (filters.certifiedOnly) {
    parts.push('仅现场用户');
  }
  return parts.length > 0 ? parts.join(' · ') : undefined;
}
