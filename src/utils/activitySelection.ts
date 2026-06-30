import type { HomeSummary, ProfileActivityItem } from '../types/backend';
import { parseActivityLegacyId } from './activityLegacyId';

/** When profile activities are loaded, they are the source of truth for subscriptions. */
export function buildSelectedActivityLegacyIds(
  homeEvents: HomeSummary['signupEvents'] | undefined,
  profileActivities: ProfileActivityItem[] | undefined,
): Set<number> {
  if (profileActivities !== undefined) {
    const ids = new Set<number>();
    for (const item of profileActivities) {
      const legacyId = parseActivityLegacyId(item.activityLegacyId ?? item.id);
      if (legacyId != null) {
        ids.add(legacyId);
      }
    }
    return ids;
  }

  const ids = new Set<number>();
  for (const item of homeEvents ?? []) {
    if (!item.going) continue;
    const legacyId = parseActivityLegacyId(item.id);
    if (legacyId != null) {
      ids.add(legacyId);
    }
  }

  return ids;
}
