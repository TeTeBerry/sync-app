import type { HomeSummary } from '../../../types/backend';
import {
  compareActivitiesNearestFirst,
  getActivityStatusFromActivity,
} from '../../../utils/activityStatus';

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
