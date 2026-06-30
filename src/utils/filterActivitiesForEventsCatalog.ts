import type { ActivityMapRegion } from '../constants/activityMapRegion';
import {
  ASIAN_ACTIVITY_AREAS,
  HOME_FEATURED_ACTIVITY_AREAS,
} from '../constants/activityArea';
import type { EventCardUi } from './apiMappers';
export {
  formatActivityAreaLabel,
  formatActivityRegionLabel,
} from './formatActivityDisplay';
import {
  compareActivitiesNearestFirst,
  getActivityStatusFromActivity,
  isRecentUpcomingActivity,
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
    return events.filter((event) => {
      const status = getActivityStatusFromActivity(event.date, event.title, now);
      return status === 'not_started' || status === 'pre_event';
    });
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

/** Home「热门亚洲电音节」：仅泰国 + 中国（含港澳台 catalog 地区）。 */
export function isHomeFeaturedCatalogActivity(
  event: Pick<EventCardUi, 'area' | 'region'>,
): boolean {
  const area = event.area?.trim();
  if (area) {
    return HOME_FEATURED_ACTIVITY_AREAS.has(area);
  }
  return event.region === 'domestic';
}

export const HOT_CAROUSEL_MIN_COUNT = 3;

export function selectRecentAsianCatalogEvents(
  events: EventCardUi[],
  limit = 5,
  now = new Date(),
): EventCardUi[] {
  return events
    .filter(
      (event) => isAsianCatalogActivity(event) && isRecentUpcomingActivity(event, now),
    )
    .sort((a, b) => compareActivitiesNearestFirst(a, b, now))
    .slice(0, limit);
}
