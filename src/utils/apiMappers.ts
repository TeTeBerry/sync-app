import type { HomeSummary } from '../types/backend';
import { ACTIVITY_GUEST_AVATARS } from '../constants/activityGuestAvatars';
import { resolveActivityThumb } from '../constants/activityImages';
import { parseActivityLegacyId } from './activityLegacyId';
import { sanitizeRemoteImageUrl } from './imageUrl';

type SignupEvent = HomeSummary['signupEvents'][number];

export interface EventCardUi {
  id: string;
  title: string;
  date: string;
  location: string;
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
      image: resolveActivityThumb(
        activity.legacyId,
        sanitizeRemoteImageUrl(activity.image) ?? activity.image,
        200,
      ),
      hot: Boolean(activity.hot),
      attendees: activity.attendees ?? 0,
      distance: activity.hot ? '热门' : '',
      category: activity.hot ? '户外电音' : 'EDM节',
    }));
}

export function resolveEventCardLegacyId(id?: string): number | null {
  return parseActivityLegacyId(id);
}

export function mapSignupEventToFeaturedEvent(item: SignupEvent): FeaturedEvent {
  const isHot = Boolean(item.hot);
  const legacyId = parseActivityLegacyId(item.id) ?? 0;
  const remote = sanitizeRemoteImageUrl(item.image) || item.image;
  return {
    id: legacyId,
    legacyId,
    title: item.title,
    date: item.date,
    venue: item.location,
    isHot,
    distance: item.location ?? '',
    attendeeCount: `${item.attendees}+`,
    remaining: '',
    guests: ACTIVITY_GUEST_AVATARS,
    image: resolveActivityThumb(legacyId, remote, 200),
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
    image: sanitizeRemoteImageUrl(activity.image) ?? activity.image ?? '',
    category: '',
    hot: Boolean(activity.hot),
    attendees: activity.attendees ?? 0,
    going: false,
  });
}

/** 首页精选：优先 hot，最多 2 条 */
export function pickHomeFeaturedEvents(signupEvents: SignupEvent[]): FeaturedEvent[] {
  const hot = signupEvents.filter((item) => item.hot);
  const rest = signupEvents.filter((item) => !item.hot);
  return [...hot, ...rest]
    .slice(0, 2)
    .map((item) => mapSignupEventToFeaturedEvent(item));
}
