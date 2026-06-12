import type { LiveInfoZone } from '@/types/backend';
import type { LiveInfoFeedItem, LiveInfoSummaryRow } from '../types/liveInfoUi';

const DEFAULT_ZONES: LiveInfoZone[] = [{ id: 'venue', label: '全场' }];

export function resolveLiveInfoZones(
  zones: LiveInfoZone[] | undefined | null,
): LiveInfoZone[] {
  if (Array.isArray(zones) && zones.length > 0) return zones;
  return DEFAULT_ZONES;
}

export function resolveLiveInfoFeed(
  feed: LiveInfoFeedItem[] | undefined | null,
): LiveInfoFeedItem[] {
  return Array.isArray(feed) ? feed : [];
}

export function resolveLiveInfoSummary(
  summary: LiveInfoSummaryRow[] | undefined | null,
): LiveInfoSummaryRow[] {
  return Array.isArray(summary) ? summary : [];
}

export function resolveLiveInfoCertCount(certCount: number | undefined | null): number {
  return typeof certCount === 'number' && certCount >= 0 ? certCount : 0;
}
