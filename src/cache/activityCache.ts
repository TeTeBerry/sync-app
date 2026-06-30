import {
  broadcastCacheData,
  forEachCacheEntry,
  getCacheData,
  setCacheData,
  setCacheDataByKey,
} from '../hooks/useApiQuery';
import {
  afterHomeSummaryCommitted,
  persistProfileSummary,
} from '../utils/homeCacheStorage';
import type {
  BackendActivity,
  HomeSummary,
  ProfileActivityItem,
  ProfileSummary,
} from '../types/backend';

export type ActivitySelectionPatch = {
  legacyId: number;
  /** Set absolute attendee total when the server returns it. */
  attendees?: number;
  going?: boolean;
};

function patchHomeSummarySelection(
  prev: HomeSummary | undefined,
  patch: ActivitySelectionPatch,
): HomeSummary | undefined {
  if (!prev) return prev;

  const { legacyId, attendees, going } = patch;
  let matched = false;
  let previousAttendees = 0;

  const signupEvents = prev.signupEvents.map((event) => {
    if (Number(event.id) !== legacyId) return event;
    matched = true;
    previousAttendees = event.attendees ?? 0;
    return {
      ...event,
      attendees: attendees ?? event.attendees ?? 0,
      ...(going !== undefined ? { going } : {}),
    };
  });

  const nextAttendees = attendees ?? previousAttendees;
  const peopleDelta = matched ? nextAttendees - previousAttendees : 0;
  const heat =
    prev.heat && peopleDelta !== 0
      ? {
          ...prev.heat,
          people: Math.max(0, (prev.heat.people ?? 0) + peopleDelta),
        }
      : prev.heat;

  return { ...prev, signupEvents, heat };
}

function patchActivitiesList(
  prev: BackendActivity[] | undefined,
  legacyId: number,
  attendees?: number,
): BackendActivity[] | undefined {
  if (!prev?.length || attendees === undefined) return prev;
  return prev.map((activity) =>
    activity.legacyId === legacyId ? { ...activity, attendees } : activity,
  );
}

function patchActivityDetailCaches(legacyId: number, attendees?: number): void {
  if (attendees === undefined) return;

  const detailPrefix = `activities|detail|${legacyId}`;
  forEachCacheEntry((key, entryData) => {
    if (!key.startsWith(detailPrefix)) return;
    const activity = entryData as BackendActivity | null;
    if (!activity) return;
    setCacheDataByKey(key, { ...activity, attendees });
  });
  broadcastCacheData(['activities', 'detail', legacyId]);
}

/** Sync activity selection across home + activity list caches without a home refetch. */
export function patchActivitySelectionInCaches(patch: ActivitySelectionPatch): void {
  setCacheData<HomeSummary>(['home', 'summary'], (prev) =>
    patchHomeSummarySelection(prev, patch),
  );

  if (patch.attendees !== undefined) {
    setCacheData<BackendActivity[]>(['activities'], (prev) =>
      patchActivitiesList(prev, patch.legacyId, patch.attendees),
    );
    patchActivityDetailCaches(patch.legacyId, patch.attendees);
  }

  broadcastCacheData(['home', 'summary']);
  broadcastCacheData(['activities']);

  const summary = getCacheData<HomeSummary>(['home', 'summary']);
  if (summary) {
    afterHomeSummaryCommitted(summary);
  }
}

/** Optimistically bump profile stats when user selects a new activity. */
export function patchProfileSummaryOnSelection(options: {
  isNewSelection: boolean;
}): boolean {
  if (!options.isNewSelection) {
    return getCacheData<ProfileSummary>(['profile', 'summary']) != null;
  }

  let patched = false;
  setCacheData<ProfileSummary>(['profile', 'summary'], (prev) => {
    if (!prev) return prev;
    patched = true;
    return {
      ...prev,
      stats: {
        ...prev.stats,
        events: (prev.stats.events ?? 0) + 1,
        ongoingEvents: (prev.stats.ongoingEvents ?? 0) + 1,
      },
    };
  });

  if (patched) {
    broadcastCacheData(['profile', 'summary']);
    const summary = getCacheData<ProfileSummary>(['profile', 'summary']);
    if (summary) {
      persistProfileSummary(summary);
    }
  }

  return patched;
}

/** Optimistically decrement profile event count when unregistering. */
export function patchProfileSummaryOnUnregister(): boolean {
  let patched = false;
  setCacheData<ProfileSummary>(['profile', 'summary'], (prev) => {
    if (!prev) return prev;
    patched = true;
    return {
      ...prev,
      stats: {
        ...prev.stats,
        events: Math.max(0, (prev.stats.events ?? 0) - 1),
        ongoingEvents: Math.max(0, (prev.stats.ongoingEvents ?? 0) - 1),
      },
    };
  });

  if (patched) {
    broadcastCacheData(['profile', 'summary']);
    const summary = getCacheData<ProfileSummary>(['profile', 'summary']);
    if (summary) {
      persistProfileSummary(summary);
    }
  }

  return patched;
}

/** Optimistically remove an activity from the profile activities list after unfollow. */
export function patchProfileActivitiesOnUnregister(activityLegacyId: number): boolean {
  const id = String(activityLegacyId);
  let patched = false;
  setCacheData<ProfileActivityItem[]>(['profile', 'activities'], (prev) => {
    if (!prev?.length) return prev;
    const next = prev.filter((item) => item.activityLegacyId !== id && item.id !== id);
    if (next.length === prev.length) return prev;
    patched = true;
    return next;
  });

  if (patched) {
    broadcastCacheData(['profile', 'activities']);
  }

  return patched;
}

/** Optimistically append an activity to profile list after subscribe/register. */
export function patchProfileActivitiesOnSubscribe(activityLegacyId: number): boolean {
  const id = String(activityLegacyId);
  let patched = false;
  const catalog = getCacheData<BackendActivity[]>(['activities']);
  const activity = catalog?.find((item) => item.legacyId === activityLegacyId);
  const home = getCacheData<HomeSummary>(['home', 'summary']);
  const homeEvent = home?.signupEvents.find(
    (event) => Number(event.id) === activityLegacyId,
  );

  setCacheData<ProfileActivityItem[]>(['profile', 'activities'], (prev) => {
    const list = prev ?? [];
    if (list.some((item) => item.activityLegacyId === id || item.id === id)) {
      return prev;
    }

    patched = true;
    return [
      ...list,
      {
        id,
        activityLegacyId: id,
        title: activity?.name ?? homeEvent?.title ?? `活动 ${id}`,
        date: activity?.date ?? homeEvent?.date ?? '',
        location: activity?.location ?? homeEvent?.location ?? '',
        image: activity?.image ?? homeEvent?.image ?? '',
        status: 'registered',
      },
    ];
  });

  if (patched) {
    broadcastCacheData(['profile', 'activities']);
  }

  return patched;
}
