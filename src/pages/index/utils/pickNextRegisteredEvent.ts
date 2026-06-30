import type { HomeSummary, ProfileActivityItem } from '../../../types/backend';
import {
  compareActivitiesNearestFirst,
  getActivityStatusFromActivity,
} from '../../../utils/activityStatus';
import { parseActivityLegacyId } from '../../../utils/activityLegacyId';

type HomeActivityEvent = HomeSummary['signupEvents'][number];

/** Nearest upcoming activity the user has registered for (`going` on home summary). */
export function pickNextRegisteredEvent(
  homeEvents: HomeActivityEvent[] | undefined,
  now?: Date,
): HomeActivityEvent | null {
  if (!homeEvents?.length) {
    return null;
  }

  const registered = homeEvents.filter(
    (event) =>
      event.going &&
      getActivityStatusFromActivity(event.date, event.title, now) !== 'ended',
  );

  if (registered.length === 0) {
    return null;
  }

  return [...registered].sort((a, b) =>
    compareActivitiesNearestFirst(
      { date: a.date, title: a.title },
      { date: b.date, title: b.title },
      now,
    ),
  )[0];
}

/**
 * Pick next event for logged-in home.
 * Prefer `registeredLegacyIds` from the global subscription store when hydrated.
 */
export function pickNextRegisteredEventForUser(
  homeEvents: HomeActivityEvent[] | undefined,
  options?: {
    registeredLegacyIds?: number[];
    profileActivities?: ProfileActivityItem[];
  },
  now?: Date,
): HomeActivityEvent | null {
  const registeredLegacyIds = options?.registeredLegacyIds;
  if (registeredLegacyIds !== undefined) {
    if (registeredLegacyIds.length === 0) {
      return null;
    }

    const subscribedIds = new Set(registeredLegacyIds);
    const alignedEvents = homeEvents?.map((event) => ({
      ...event,
      going: subscribedIds.has(Number(event.id)),
    }));

    return pickNextRegisteredEvent(alignedEvents, now);
  }

  const profileActivities = options?.profileActivities;
  if (profileActivities !== undefined) {
    if (profileActivities.length === 0) {
      return null;
    }

    const subscribedIds = new Set<number>();
    for (const item of profileActivities) {
      const legacyId = parseActivityLegacyId(item.activityLegacyId ?? item.id);
      if (legacyId != null) {
        subscribedIds.add(legacyId);
      }
    }

    if (subscribedIds.size === 0) {
      return null;
    }

    const alignedEvents = homeEvents?.map((event) => ({
      ...event,
      going: subscribedIds.has(Number(event.id)),
    }));

    return pickNextRegisteredEvent(alignedEvents, now);
  }

  return pickNextRegisteredEvent(homeEvents, now);
}
