import type { BackendActivity } from '@/types/backend';
import {
  compareActivitiesNearestFirst,
  getActivityStatusFromActivity,
} from './activityStatus';

export function filterActivitiesForPicker(
  activities: BackendActivity[] | undefined,
  query: string,
): BackendActivity[] {
  const upcoming = (activities ?? []).filter(
    (activity) =>
      getActivityStatusFromActivity(activity.date, activity.name) !== 'ended',
  );
  const sorted = [...upcoming].sort(compareActivitiesNearestFirst);
  const trimmedQuery = query.trim().toLowerCase();
  if (!trimmedQuery) {
    return sorted;
  }

  return sorted.filter((activity) => {
    const haystack = [activity.name, activity.code, ...(activity.alias ?? [])]
      .map((value) => value?.trim())
      .filter(Boolean)
      .join(' ')
      .toLowerCase();
    return haystack.includes(trimmedQuery);
  });
}
