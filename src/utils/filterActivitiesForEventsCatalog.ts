import type { ActivityMapRegion } from '../constants/activityMapRegion';
import { ASIAN_ACTIVITY_AREAS } from '../constants/activityArea';
import { ACTIVITY_MAP_REGION_LABELS } from '../constants/activityMapRegion';
import type { EventCardUi } from './apiMappers';
import {
  compareActivitiesNearestFirst,
  getActivityStatusFromActivity,
  parseActivityDateRange,
} from './activityStatus';

export type EventsCatalogRegionFilter = ActivityMapRegion | 'all';

export type EventsCatalogTimeChip = 'upcoming' | 'thisMonth' | 'hot';

export function filterActivitiesByRegion(
  events: EventCardUi[],
  region: EventsCatalogRegionFilter,
): EventCardUi[] {
  if (region === 'all') {
    return events;
  }
  return events.filter((event) => event.region === region);
}

export function filterActivitiesByTimeChip(
  events: EventCardUi[],
  chip: EventsCatalogTimeChip | null,
  now = new Date(),
): EventCardUi[] {
  if (!chip) {
    return events;
  }

  if (chip === 'hot') {
    return events.filter((event) => event.hot);
  }

  if (chip === 'upcoming') {
    return events.filter(
      (event) =>
        getActivityStatusFromActivity(event.date, event.title, now) === 'not_started',
    );
  }

  const monthStart = new Date(now.getFullYear(), now.getMonth(), 1);
  const monthEnd = new Date(now.getFullYear(), now.getMonth() + 1, 0, 23, 59, 59);

  return events.filter((event) => {
    const yearHint = String(now.getFullYear());
    const range = parseActivityDateRange(event.date, yearHint);
    if (!range) {
      return false;
    }
    return range.start <= monthEnd && range.end >= monthStart;
  });
}

export function isAsianCatalogActivity(
  event: Pick<EventCardUi, 'area' | 'region'>,
): boolean {
  const area = event.area?.trim();
  if (area) {
    return ASIAN_ACTIVITY_AREAS.has(area);
  }
  return event.region === 'domestic' || event.region === 'hmt';
}

export const HOT_CAROUSEL_MIN_COUNT = 3;

export function selectHotCatalogEvents(
  events: EventCardUi[],
  limit = 5,
  now = new Date(),
): EventCardUi[] {
  return events
    .filter(
      (event) =>
        event.hot === true &&
        isAsianCatalogActivity(event) &&
        getActivityStatusFromActivity(event.date, event.title, now) !== 'ended',
    )
    .sort((a, b) => compareActivitiesNearestFirst(a, b, now))
    .slice(0, limit);
}

export function formatActivityRegionLabel(region?: ActivityMapRegion): string | null {
  if (!region) {
    return null;
  }
  return ACTIVITY_MAP_REGION_LABELS[region];
}

export function formatActivityAreaLabel(
  event: Pick<EventCardUi, 'area' | 'region'>,
): string | null {
  const area = event.area?.trim();
  if (area) {
    return area;
  }
  return formatActivityRegionLabel(event.region);
}
