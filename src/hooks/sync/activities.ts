import { useMemo } from 'react';
import {
  cancelActivityRegistration,
  fetchActivities,
  fetchActivityByLegacyId,
  fetchHomeSummary,
  registerForActivity,
} from '../../api/sync/activities';
import { isApiEnabled } from '../../constants/api';
import type { BackendActivity } from '../../types/backend';
import {
  seedActivityDetailsFromHomeSummary,
  seedActivityDetailsFromList,
} from '../../utils/activityDetailCache';
import {
  STALE_ACTIVITIES_LIST_MS,
  STALE_ACTIVITY_DETAIL_MS,
  STALE_HOME_SUMMARY_MS,
} from '../../constants/queryCache';
import {
  compareActivitiesNearestFirst,
  findNearestUpcomingActivity,
  getActivityStatusFromActivity,
  type ActivityDateFields,
} from '../../utils/activityStatus';
import {
  mapActivitiesToEvents,
  pickHomeFeaturedEvents,
  type EventCardUi,
  type FeaturedEvent,
} from '../../utils/apiMappers';
import {
  persistHomeSummary,
  seedPopularPostsCache,
} from '../../utils/homeCacheStorage';
import type { HomeSummary } from '../../types/backend';
import {
  invalidateRegistration,
  invalidateUser,
  invalidateProfile,
} from '../../utils/queryInvalidation';
import { getCacheData, useApiQuery } from '../useApiQuery';
import type { QueryEnableOptions } from './types';
import type { UpdateCurrentUserPayload } from '../../types/backend';
import { updateCurrentUser } from '../../api/sync/users';

export function useActivitiesQuery(options?: QueryEnableOptions) {
  const tabEnabled = options?.enabled ?? true;
  const enabled = isApiEnabled() && tabEnabled;

  return useApiQuery({
    queryKey: ['activities'],
    queryFn: async () => {
      const activities = await fetchActivities();
      seedActivityDetailsFromList(activities);
      return activities;
    },
    enabled,
    staleTime: STALE_ACTIVITIES_LIST_MS,
  });
}

export function useEventList(options?: QueryEnableOptions) {
  const tabEnabled = options?.enabled ?? true;
  const query = useActivitiesQuery({ enabled: tabEnabled });

  const events = useMemo((): EventCardUi[] => {
    if (!query.data) return [];
    return [...mapActivitiesToEvents(query.data)].sort(compareActivitiesNearestFirst);
  }, [query.data]);

  return {
    events,
    isLoading: tabEnabled && query.isLoading,
    isError: tabEnabled && query.isError,
    refetch: query.refetch,
  };
}

export function useHomeSummary() {
  return useApiQuery({
    queryKey: ['home', 'summary'],
    queryFn: async () => {
      const result = await fetchHomeSummary();
      persistHomeSummary(result);
      seedActivityDetailsFromHomeSummary(result);
      seedPopularPostsCache(result.popularPosts);
      return result;
    },
    enabled: isApiEnabled(),
    staleTime: STALE_HOME_SUMMARY_MS,
  });
}

export function useFeaturedEvents() {
  const { data: summary, isLoading } = useHomeSummary();

  const items = useMemo((): FeaturedEvent[] => {
    const signupEvents = summary?.signupEvents ?? [];
    const inProgress = signupEvents.filter(
      (item) => getActivityStatusFromActivity(item.date, item.title) === 'in_progress',
    );
    return pickHomeFeaturedEvents(inProgress);
  }, [summary]);

  return {
    items,
    isLoading,
  };
}

function mergeHomeCountdownCandidates(
  signupEvents: HomeSummary['signupEvents'],
  activities: BackendActivity[] | undefined,
): ActivityDateFields[] {
  const seen = new Set<string>();
  const candidates: ActivityDateFields[] = [];

  const add = (title: string, date?: string) => {
    const key = `${title}|${date ?? ''}`;
    if (seen.has(key)) return;
    seen.add(key);
    candidates.push({ title, date });
  };

  for (const event of signupEvents) {
    add(event.title, event.date);
  }
  for (const activity of activities ?? []) {
    add(activity.name, activity.date);
  }

  return candidates;
}

export function useNearestUpcomingForCountdown() {
  const { data: summary } = useHomeSummary();

  return useMemo(() => {
    const signupEvents = summary?.signupEvents ?? [];
    const candidates = mergeHomeCountdownCandidates(signupEvents, undefined);
    const nearest = findNearestUpcomingActivity(candidates);
    if (!nearest) return null;

    const title = nearest.title ?? nearest.name;
    if (!title) return null;

    return { title, startAt: nearest.startAt };
  }, [summary]);
}

export function useActivityDetailQuery(legacyId?: number) {
  const enabled =
    isApiEnabled() && legacyId != null && !Number.isNaN(legacyId) && legacyId > 0;

  return useApiQuery({
    queryKey: ['activities', 'detail', legacyId],
    queryFn: async () => {
      const result = await fetchActivityByLegacyId(legacyId as number);
      if (result != null) {
        return result;
      }
      const seeded = getCacheData<BackendActivity | null>([
        'activities',
        'detail',
        legacyId,
      ]);
      return seeded ?? null;
    },
    enabled,
    staleTime: STALE_ACTIVITY_DETAIL_MS,
  });
}

export async function invalidateRegistrationQueries() {
  await invalidateRegistration();
}

export async function registerForActivityAndInvalidate(legacyId: number) {
  const result = await registerForActivity(legacyId);
  try {
    await invalidateRegistrationQueries();
  } catch {
    // Registration succeeded; cache refresh is best-effort.
  }
  return result;
}

export async function cancelActivityRegistrationAndInvalidate(legacyId: number) {
  const result = await cancelActivityRegistration(legacyId);
  await invalidateRegistrationQueries();
  return result;
}

export async function updateCurrentUserAndInvalidate(
  payload: UpdateCurrentUserPayload,
) {
  const user = await updateCurrentUser(payload);
  await Promise.all([invalidateUser(), invalidateProfile()]);
  return user;
}
