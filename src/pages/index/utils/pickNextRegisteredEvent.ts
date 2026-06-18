import type { HomeSummary } from '../../../types/backend';
import { parseActivityLegacyId } from '../../../utils/activityLegacyId';
import {
  compareActivitiesNearestFirst,
  getActivityStatusFromActivity,
} from '../../../utils/activityStatus';

type SignupEvent = HomeSummary['signupEvents'][number];

/** Nearest upcoming activity the user has registered for. */
export function pickNextRegisteredEvent(
  signupEvents: SignupEvent[] | undefined,
  registeredLegacyIds: Set<number>,
  now?: Date,
): SignupEvent | null {
  if (!signupEvents?.length || registeredLegacyIds.size === 0) {
    return null;
  }

  const registered = signupEvents.filter((event) => {
    const legacyId = parseActivityLegacyId(event.id);
    return (
      legacyId != null &&
      registeredLegacyIds.has(legacyId) &&
      getActivityStatusFromActivity(event.date, event.title, now) !== 'ended'
    );
  });

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
