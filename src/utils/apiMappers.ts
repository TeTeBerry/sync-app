import type { HomeSummary } from "../types/backend";
import { ACTIVITY_GUEST_AVATARS } from "../constants/activityGuestAvatars";

type SignupEvent = HomeSummary["signupEvents"][number];

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
  id: number;
  title: string;
  date: string;
  venue: string;
  distance: string;
  attendeeCount: string;
  remaining: string;
  guests: string[];
  image?: string;
  logo?: string;
  going: boolean;
};

export function buildActivityNameMap(activities: import("../types/backend").BackendActivity[]): Map<string, string> {
  return new Map(activities.map((item) => [item.code, item.name]));
}

export function findBackendActivityByLegacyId(
  activities: import("../types/backend").BackendActivity[],
  legacyId: number,
): import("../types/backend").BackendActivity | undefined {
  return activities.find((activity) => activity.legacyId === legacyId);
}

export function mapActivitiesToEvents(
  activities: import("../types/backend").BackendActivity[],
): EventCardUi[] {
  return activities.map((activity) => ({
    id: String(activity.legacyId ?? activity._id),
    title: activity.name,
    going: false,
    date: activity.date ?? "",
    location: activity.location ?? "",
    image: activity.image ?? "",
    hot: Boolean(activity.hot),
    attendees: activity.attendees ?? 0,
    distance: activity.hot ? "热门" : "",
    category: activity.hot ? "户外电音" : "EDM节",
  }));
}

export function mapSignupEventToFeaturedEvent(item: SignupEvent): FeaturedEvent {
  return {
    id: item.id,
    title: item.title,
    date: item.date,
    venue: item.location,
    distance: item.hot ? "热门" : item.category,
    attendeeCount: `${item.attendees}+`,
    remaining: "",
    guests: ACTIVITY_GUEST_AVATARS,
    image: item.image || undefined,
    going: item.going,
  };
}

export function mapBackendActivityToFeaturedEvent(
  activity: import("../types/backend").BackendActivity,
): FeaturedEvent {
  return mapSignupEventToFeaturedEvent({
    id: activity.legacyId,
    title: activity.name,
    date: activity.date ?? "",
    location: activity.location ?? "",
    image: activity.image ?? "",
    category: activity.hot ? "户外电音" : "EDM节",
    hot: Boolean(activity.hot),
    attendees: activity.attendees ?? 0,
    going: false,
  });
}

/** 首页精选：优先 hot，最多 2 条 */
export function pickHomeFeaturedEvents(signupEvents: SignupEvent[]): FeaturedEvent[] {
  const hot = signupEvents.filter((item) => item.hot);
  const rest = signupEvents.filter((item) => !item.hot);
  return [...hot, ...rest].slice(0, 2).map(mapSignupEventToFeaturedEvent);
}
