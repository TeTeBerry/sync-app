import type { ActivityMapRegion } from '../constants/activityMapRegion';
import type { HomeSummary } from '../types/backend';
import { resolveCatalogActivityImage } from '../constants/activityCatalogImages';
import { resolveActivityThumb } from '../constants/activityImages';
import { getActivityTypeLabel } from '../constants/activityType';
import { HOME_FEATURED_PIN_LEGACY_ID } from '../constants/homeFeatured';
import { parseActivityLegacyId } from './activityLegacyId';
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
  distance: string;
  image: string;
  attendees: number;
  category: string;
  hot: boolean;
  going: boolean;
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

export function buildActivityNameMap(
  activities: import('../types/backend').BackendActivity[],
): Map<string, string> {
  return new Map(activities.map((item) => [item.code, item.name]));
}

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
      image: resolveActivityThumb(
        sanitizeRemoteImageUrl(
          resolveCatalogActivityImage(activity.legacyId, activity.image),
        ) ?? resolveCatalogActivityImage(activity.legacyId, activity.image),
        200,
      ),
      hot: Boolean(activity.hot),
      attendees: activity.attendees ?? 0,
      distance: activity.hot ? '热门' : '',
      category: getActivityTypeLabel(activity.activityType),
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
    attendeeCount: `${item.attendees}+`,
    remaining: '',
    guests: [],
    image: resolveActivityThumb(remote, 200),
    going: item.going,
  };
}

export function mapBackendActivityToFeaturedEvent(
  activity: import('../types/backend').BackendActivity,
): FeaturedEvent {
  return mapSignupEventToFeaturedEvent({
    id: activity.legacyId,
    title: activity.name,
    date: activity.date ?? '',
    location: activity.location ?? '',
    image:
      sanitizeRemoteImageUrl(
        resolveCatalogActivityImage(activity.legacyId, activity.image),
      ) ??
      resolveCatalogActivityImage(activity.legacyId, activity.image) ??
      '',
    category: getActivityTypeLabel(activity.activityType),
    hot: Boolean(activity.hot),
    attendees: activity.attendees ?? 0,
    going: false,
  });
}

/** 首页热门活动：风暴电音节置顶，其余热门优先，支持横向滑动展示多场 */
export function pickHomeFeaturedEvents(signupEvents: SignupEvent[]): FeaturedEvent[] {
  const hot = signupEvents.filter((item) => item.hot);
  const rest = signupEvents.filter((item) => !item.hot);
  const ordered = [...hot, ...rest];
  const pinIndex = ordered.findIndex(
    (item) => parseActivityLegacyId(item.id) === HOME_FEATURED_PIN_LEGACY_ID,
  );
  if (pinIndex > 0) {
    const [pinned] = ordered.splice(pinIndex, 1);
    ordered.unshift(pinned);
  }
  return ordered.map((item) => mapSignupEventToFeaturedEvent(item));
}
