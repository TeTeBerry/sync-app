import { useEffect, useMemo, useRef } from 'react';
import {
  cancelActivityRegistration,
  fetchActivities,
  fetchActivityByLegacyId,
  fetchHomeSummary,
  registerForActivity,
} from '../../api/sync/activities';
import { isLiveApi } from '../../constants/api';
import { isLoggedIn } from '../../utils/authStorage';
import { subscribeAuthSessionChange } from '../../utils/authSession';
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
  withCatalogActivityImage,
  withCatalogHomeSummary,
} from '../../utils/activityCatalog';
import {
  persistHomeSummary,
  persistActivities,
  seedPopularPostsCache,
} from '../../utils/homeCacheStorage';
import type { HomeSummary } from '../../types/backend';
import { patchActivityRegistrationInCaches } from '../../cache/activityCache';
import {
  invalidateRegistrationProfile,
  invalidateUser,
  invalidateProfile,
} from '../../utils/queryInvalidation';
import { getCacheData, useApiQuery } from '../useApiQuery';
import type { QueryEnableOptions } from './types';
import type { UpdateCurrentUserPayload } from '../../types/backend';
import { updateCurrentUser } from '../../api/sync/users';
import { useProfileActivitiesQuery } from './profile';
import { buildRegisteredActivityLegacyIds } from '../../utils/activityRegistration';

export function useActivitiesQuery(options?: QueryEnableOptions) {
  const tabEnabled = options?.enabled ?? true;
  const enabled = isLiveApi() && tabEnabled;

  return useApiQuery({
    queryKey: ['activities'],
    queryFn: async () => {
      const activities = (await fetchActivities()).map(withCatalogActivityImage);
      seedActivityDetailsFromList(activities);
      persistActivities(activities);
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
    isLoading: tabEnabled && query.isLoading && query.data === undefined,
    isError: tabEnabled && query.isError,
    refetch: query.refetch,
  };
}

export function useHomeSummary() {
  const query = useApiQuery({
    queryKey: ['home', 'summary'],
    queryFn: async () => {
      const result = withCatalogHomeSummary(await fetchHomeSummary());
      persistHomeSummary(result);
      seedActivityDetailsFromHomeSummary(result);
      seedPopularPostsCache(result.popularPosts);
      return result;
    },
    enabled: isLiveApi(),
    staleTime: STALE_HOME_SUMMARY_MS,
  });

  const { refetch } = query;
  const refreshedGoingFlagsRef = useRef(false);

  useEffect(() => {
    if (!isLiveApi() || !isLoggedIn() || refreshedGoingFlagsRef.current) {
      return;
    }
    refreshedGoingFlagsRef.current = true;
    void refetch({ background: true });
  }, [refetch]);

  useEffect(() => {
    if (!isLiveApi()) return;
    return subscribeAuthSessionChange(() => {
      if (isLoggedIn()) {
        void refetch({ background: true });
      }
    });
  }, [refetch]);

  return query;
}

export function useRegisteredActivityLegacyIds() {
  const { data: summary } = useHomeSummary();
  const profileActivitiesQuery = useProfileActivitiesQuery();

  return useMemo(
    () =>
      buildRegisteredActivityLegacyIds(
        summary?.signupEvents,
        profileActivitiesQuery.data,
      ),
    [summary?.signupEvents, profileActivitiesQuery.data],
  );
}

export function useFeaturedEvents() {
  const { data: summary, isLoading } = useHomeSummary();

  const items = useMemo((): FeaturedEvent[] => {
    const signupEvents = summary?.signupEvents ?? [];
    const active = signupEvents.filter(
      (item) => getActivityStatusFromActivity(item.date, item.title) !== 'ended',
    );
    return pickHomeFeaturedEvents(active);
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
    isLiveApi() && legacyId != null && !Number.isNaN(legacyId) && legacyId > 0;

  return useApiQuery({
    queryKey: ['activities', 'detail', legacyId],
    queryFn: async () => {
      const result = await fetchActivityByLegacyId(legacyId as number);
      if (result != null) {
        return withCatalogActivityImage(result);
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
  await invalidateRegistrationProfile();
}

export async function registerForActivityAndInvalidate(legacyId: number) {
  const result = await registerForActivity(legacyId);
  patchActivityRegistrationInCaches({
    legacyId,
    attendees: result.attendees,
    going: true,
  });
  try {
    await invalidateRegistrationQueries();
  } catch {
    // Registration succeeded; cache refresh is best-effort.
  }
  return result;
}

export async function cancelActivityRegistrationAndInvalidate(legacyId: number) {
  const result = await cancelActivityRegistration(legacyId);
  patchActivityRegistrationInCaches({
    legacyId,
    attendees: result.attendees,
    going: false,
  });
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
