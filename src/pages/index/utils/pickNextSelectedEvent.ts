import type { HomeSummary } from '../../../types/backend';
import { parseActivityLegacyId } from '../../../utils/activityLegacyId';
import {
  compareActivitiesNearestFirst,
  getActivityStatusFromActivity,
} from '../../../utils/activityStatus';

type HomeActivityEvent = HomeSummary['signupEvents'][number];

/** Nearest upcoming activity the user has selected. */
export function pickNextSelectedEvent(
  homeEvents: HomeActivityEvent[] | undefined,
  selectedLegacyIds: Set<number>,
  now?: Date,
): HomeActivityEvent | null {
  if (!homeEvents?.length || selectedLegacyIds.size === 0) {
    return null;
  }

  const selected = homeEvents.filter((event) => {
    const legacyId = parseActivityLegacyId(event.id);
    return (
      legacyId != null &&
      selectedLegacyIds.has(legacyId) &&
      getActivityStatusFromActivity(event.date, event.title, now) !== 'ended'
    );
  });

  if (selected.length === 0) {
    return null;
  }

  return [...selected].sort((a, b) =>
    compareActivitiesNearestFirst(
      { date: a.date, title: a.title },
      { date: b.date, title: b.title },
      now,
    ),
  )[0];
}
