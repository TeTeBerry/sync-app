import type { HomeSummary, ProfileActivityItem } from '../types/backend';
import { parseActivityLegacyId } from './activityLegacyId';

/** Merge `/home` `going` flags with `/profile/activities` (source of truth for logged-in user). */
export function buildRegisteredActivityLegacyIds(
  signupEvents: HomeSummary['signupEvents'] | undefined,
  profileActivities: ProfileActivityItem[] | undefined,
): Set<number> {
  const ids = new Set<number>();

  for (const item of signupEvents ?? []) {
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

export function isActivityRegistered(
  legacyId: number | null | undefined,
  registeredLegacyIds: Set<number>,
): boolean {
  return legacyId != null && registeredLegacyIds.has(legacyId);
}
