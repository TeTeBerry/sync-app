import type { ActivityMapRegion } from '../constants/activityMapRegion';
import type { HomeSummary } from '../types/backend';
import { resolveCatalogActivityImage } from '../constants/activityCatalogImages';
import { resolveActivityThumb } from '../constants/activityImages';
import { getActivityTypeLabel } from '../constants/activityType';
import { isHomeFeaturedCatalogActivity } from './filterActivitiesForEventsCatalog';
import { parseActivityLegacyId } from './activityLegacyId';
import { compareActivitiesNearestFirst } from './activityStatus';
import { sanitizeRemoteImageUrl } from './imageUrl';

type SignupEvent = HomeSummary['signupEvents'][number];

export interface EventCardUi {
  id: string;
  title: string;
  date: string;
  location: string;
  latitude?: number;
  longitude?: number;
  region?: ActivityMapRegion;
  area?: string;
  alias?: string[];
  image: string;
  attendees: number;
  category: string;
  hot: boolean;
  going: boolean;
  lineupPublished?: boolean;
  recruitPostCount?: number;
  infoSource?: string;
  infoUpdatedAt?: string;
}

export type FeaturedEvent = {
  /** Activity legacy id used for `/activities/:legacyId` and event-detail navigation. */
  id: number;
  legacyId: number;
  title: string;
  date: string;
  venue: string;
  distance: string;
  category: string;
  isHot: boolean;
  attendeeCount: string;
  remaining: string;
  guests: string[];
  image?: string;
  logo?: string;
  going: boolean;
};

export function findBackendActivityByLegacyId(
  activities: import('../types/backend').BackendActivity[],
  legacyId: number,
): import('../types/backend').BackendActivity | undefined {
  return activities.find((activity) => activity.legacyId === legacyId);
}

export function resolveFeaturedEventLegacyId(
  event: Pick<FeaturedEvent, 'id' | 'legacyId'>,
): number | null {
  return parseActivityLegacyId(event.legacyId ?? event.id);
}

export function mapActivitiesToEvents(
  activities: import('../types/backend').BackendActivity[],
): EventCardUi[] {
  return activities
    .filter((activity) => parseActivityLegacyId(activity.legacyId) != null)
    .map((activity) => ({
      id: String(activity.legacyId),
      title: activity.name,
      going: false,
      date: activity.date ?? '',
      location: activity.location ?? '',
      latitude: activity.latitude,
      longitude: activity.longitude,
      region: activity.region as ActivityMapRegion | undefined,
      area: activity.area,
      alias: activity.alias,
      image: resolveActivityThumb(
        sanitizeRemoteImageUrl(
          resolveCatalogActivityImage(activity.legacyId, activity.image),
        ) ?? resolveCatalogActivityImage(activity.legacyId, activity.image),
        200,
      ),
      hot: Boolean(activity.hot),
      attendees: activity.attendees ?? 0,
      category: getActivityTypeLabel(activity.activityType),
      lineupPublished: activity.lineupPublished,
      recruitPostCount: activity.recruitPostCount ?? 0,
      infoSource: activity.infoSource,
      infoUpdatedAt: activity.infoUpdatedAt,
    }));
}

export function resolveEventCardLegacyId(id?: string): number | null {
  return parseActivityLegacyId(id);
}

export function mapSignupEventToFeaturedEvent(item: SignupEvent): FeaturedEvent {
  const isHot = Boolean(item.hot);
  const legacyId = parseActivityLegacyId(item.id) ?? 0;
  const catalogImage = resolveCatalogActivityImage(legacyId, item.image);
  const remote = sanitizeRemoteImageUrl(catalogImage) || catalogImage;
  return {
    id: legacyId,
    legacyId,
    title: item.title,
    date: item.date,
    venue: item.location,
    category: item.category ?? '',
    isHot,
    distance: item.location ?? '',
    attendeeCount: String(item.attendees ?? 0),
    remaining: '',
    guests: [],
    image: resolveActivityThumb(remote, 200),
    going: item.going,
  };
}

/** 首页热门轮播最多展示场次数。 */
export const HOME_FEATURED_EVENTS_LIMIT = 3;

/** 首页热门活动：仅展示泰国 / 中国场次；未选择时按开始时间就近；已选择的活动靠前。 */
export function pickHomeFeaturedEvents(
  signupEvents: SignupEvent[],
  selectedLegacyIds?: Set<number>,
  now?: Date,
): FeaturedEvent[] {
  const featuredPool = signupEvents.filter((event) =>
    isHomeFeaturedCatalogActivity({ area: event.area, region: event.region }),
  );
  const hasSelections = (selectedLegacyIds?.size ?? 0) > 0;

  const sortNearest = (items: SignupEvent[]) =>
    [...items].sort((a, b) =>
      compareActivitiesNearestFirst(
        { date: a.date, title: a.title },
        { date: b.date, title: b.title },
        now,
      ),
    );

  let ordered: SignupEvent[];
  if (!hasSelections) {
    ordered = sortNearest(featuredPool);
  } else {
    const selected: SignupEvent[] = [];
    const rest: SignupEvent[] = [];
    for (const event of featuredPool) {
      const legacyId = parseActivityLegacyId(event.id);
      if (legacyId != null && selectedLegacyIds!.has(legacyId)) {
        selected.push(event);
      } else {
        rest.push(event);
      }
    }
    ordered = [...sortNearest(selected), ...sortNearest(rest)];
  }

  return ordered
    .slice(0, HOME_FEATURED_EVENTS_LIMIT)
    .map((item) => mapSignupEventToFeaturedEvent(item));
}
