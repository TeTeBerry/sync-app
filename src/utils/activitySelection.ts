import type { HomeSummary, ProfileActivityItem } from '../types/backend';
import { parseActivityLegacyId } from './activityLegacyId';

/** Merge `/home` `going` flags with `/profile/activities` (profile is source of truth when logged in). */
export function buildSelectedActivityLegacyIds(
  homeEvents: HomeSummary['signupEvents'] | undefined,
  profileActivities: ProfileActivityItem[] | undefined,
): Set<number> {
  const ids = new Set<number>();

  for (const item of homeEvents ?? []) {
    if (!item.going) continue;
    const legacyId = parseActivityLegacyId(item.id);
    if (legacyId != null) {
      ids.add(legacyId);
    }
  }

  for (const item of profileActivities ?? []) {
    const legacyId = parseActivityLegacyId(item.id);
    if (legacyId != null) {
      ids.add(legacyId);
    }
  }

  return ids;
}
