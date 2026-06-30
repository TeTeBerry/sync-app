import { getCacheData } from '@/hooks/useApiQuery';
import type { BackendActivity } from '@/types/backend';

/**
 * Resolve whether lineup is officially published for subscribe / prep UI.
 * Catalog list is used when detail cache was seeded without `lineupPublished`.
 */
export function resolveLineupPublished(
  activity: BackendActivity | null | undefined,
  activityLegacyId?: number,
): boolean | undefined {
  if (!activity) {
    return undefined;
  }

  if (activity.lineupPublished === true || activity.lineupPublished === false) {
    return activity.lineupPublished;
  }

  const legacyId = activityLegacyId ?? activity.legacyId;
  if (!Number.isFinite(legacyId) || legacyId <= 0) {
    return undefined;
  }

  const catalog = getCacheData<BackendActivity[]>(['activities']);
  const match = catalog?.find((item) => item.legacyId === legacyId);
  if (match?.lineupPublished === true || match?.lineupPublished === false) {
    return match.lineupPublished;
  }

  return undefined;
}

/** Show subscribe banner only when lineup is explicitly still pending. */
export function shouldShowLineupSubscribeBanner(
  activity: BackendActivity | null | undefined,
  activityLegacyId?: number,
): boolean {
  return resolveLineupPublished(activity, activityLegacyId) === false;
}
