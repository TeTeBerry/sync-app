import type {
  BackendActivity,
  HomeSummary,
  ProfileActivityItem,
} from '../types/backend';
import type { ActivityDateFields } from './activityStatus';
import { parseActivityLegacyId } from './activityLegacyId';

export type CountdownActivityCandidate = ActivityDateFields & {
  legacyId?: number;
};

function toCountdownCandidate(
  fields: ActivityDateFields & { legacyId?: number },
): CountdownActivityCandidate | null {
  const title = fields.title?.trim() || fields.name?.trim();
  const date = fields.date?.trim();
  if (!title && !date) {
    return null;
  }
  return {
    title: fields.title ?? fields.name,
    name: fields.name ?? fields.title,
    date: fields.date,
    legacyId: fields.legacyId,
  };
}

/** Merge `/home` signup rows with catalog activities (deduped by legacyId). */
export function mergeCountdownActivityCandidates(
  signupEvents: HomeSummary['signupEvents'] | undefined,
  activities: BackendActivity[] | undefined,
): CountdownActivityCandidate[] {
  const byLegacyId = new Map<number, CountdownActivityCandidate>();
  const withoutId: CountdownActivityCandidate[] = [];

  const add = (candidate: CountdownActivityCandidate | null) => {
    if (!candidate) return;
    if (candidate.legacyId != null) {
      byLegacyId.set(candidate.legacyId, candidate);
      return;
    }
    withoutId.push(candidate);
  };

  for (const event of signupEvents ?? []) {
    const legacyId = parseActivityLegacyId(event.id);
    add(
      toCountdownCandidate({
        title: event.title,
        date: event.date,
        legacyId: legacyId ?? undefined,
      }),
    );
  }

  for (const activity of activities ?? []) {
    add(
      toCountdownCandidate({
        title: activity.name,
        date: activity.date,
        legacyId: activity.legacyId,
      }),
    );
  }

  return [...byLegacyId.values(), ...withoutId];
}

/** Home countdown pool: all catalog events, or only registered ones when user has signups. */
export function pickCountdownActivityCandidates(
  candidates: CountdownActivityCandidate[],
  registeredLegacyIds: Set<number>,
): CountdownActivityCandidate[] {
  if (registeredLegacyIds.size === 0) {
    return candidates;
  }

  return candidates.filter(
    (item) => item.legacyId != null && registeredLegacyIds.has(item.legacyId),
  );
}

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
