import type { BackendActivity } from '../../../types/backend';
import {
  compareActivitiesNearestFirst,
  getActivityStatusFromActivity,
} from '../../../utils/activityStatus';

/** Nearest upcoming catalog activity for artist sheet CTA. */
export function pickNearestUpcomingActivity(
  activities: BackendActivity[],
  now?: Date,
): BackendActivity | null {
  if (!activities.length) {
    return null;
  }

  const sorted = [...activities].sort((a, b) =>
    compareActivitiesNearestFirst(
      { date: a.date, title: a.name },
      { date: b.date, title: b.name },
      now,
    ),
  );

  return (
    sorted.find(
      (activity) =>
        getActivityStatusFromActivity(activity.date, activity.name, now) !== 'ended',
    ) ?? null
  );
}
