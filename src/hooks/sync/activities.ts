import { useEffect, useMemo, useRef } from 'react';
import {
  fetchActivities,
  fetchActivityByLegacyId,
  fetchCatalogLineupArtists,
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
  getActivityStatusFromActivity,
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
import { persistHomeSummary, persistActivities } from '../../utils/homeCacheStorage';
import {
  patchActivitySelectionInCaches,
  patchProfileSummaryOnSelection,
} from '../../cache/activityCache';
import {
  invalidateProfileSummary,
  invalidateUser,
  invalidateProfile,
} from '../../utils/queryInvalidation';
import { getCacheData, useApiQuery } from '../useApiQuery';
import { useRefetchOnShowWhenEmpty } from '../useRefetchOnShowWhenEmpty';
import type { QueryEnableOptions } from './types';
import type { UpdateCurrentUserPayload } from '../../types/backend';
import { updateCurrentUser } from '../../api/sync/users';
import { useProfileActivitiesQuery } from './profile';
import { buildSelectedActivityLegacyIds } from '../../utils/activitySelection';
import { parseActivityLegacyId } from '../../utils/activityLegacyId';

export function useActivitiesQuery(options?: QueryEnableOptions) {
  const tabEnabled = options?.enabled ?? true;
  const enabled = isLiveApi() && tabEnabled;

  const query = useApiQuery({
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

  useRefetchOnShowWhenEmpty({
    data: query.data,
    isError: query.isError,
    isLoading: query.isLoading,
    refetch: query.refetch,
    enabled,
  });

  return query;
}

export function useEventList(options?: QueryEnableOptions) {
  const tabEnabled = options?.enabled ?? true;
  const query = useActivitiesQuery({ enabled: tabEnabled });
  const selectedLegacyIds = useSelectedActivityLegacyIds();

  const events = useMemo((): EventCardUi[] => {
    if (!query.data) return [];
    return [...mapActivitiesToEvents(query.data)]
      .map((event) => {
        const legacyId = parseActivityLegacyId(event.id);
        return {
          ...event,
          going: legacyId != null && selectedLegacyIds.has(legacyId),
        };
      })
      .sort(compareActivitiesNearestFirst);
  }, [query.data, selectedLegacyIds]);

  return {
    events,
    isLoading: tabEnabled && query.isLoading && query.data === undefined,
    isError: tabEnabled && query.isError,
    refetch: query.refetch,
  };
}

export function useCatalogLineupArtists(options?: QueryEnableOptions) {
  const tabEnabled = options?.enabled ?? true;

  return useApiQuery({
    queryKey: ['activities', 'lineup-artists'],
    queryFn: fetchCatalogLineupArtists,
    enabled: isLiveApi() && tabEnabled,
    staleTime: STALE_ACTIVITIES_LIST_MS,
  });
}

export function useHomeSummary() {
  const query = useApiQuery({
    queryKey: ['home', 'summary'],
    queryFn: async () => {
      const result = withCatalogHomeSummary(await fetchHomeSummary());
      persistHomeSummary(result);
      seedActivityDetailsFromHomeSummary(result);
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

  useRefetchOnShowWhenEmpty({
    data: query.data,
    isError: query.isError,
    isLoading: query.isLoading,
    refetch: query.refetch,
    enabled: isLiveApi(),
  });

  return query;
}

export function useSelectedActivityLegacyIds() {
  const { data: summary } = useHomeSummary();
  const profileActivitiesQuery = useProfileActivitiesQuery();
  const loggedIn = isLoggedIn();

  return useMemo(
    () =>
      buildSelectedActivityLegacyIds(
        loggedIn ? summary?.signupEvents : undefined,
        loggedIn ? profileActivitiesQuery.data : undefined,
      ),
    [loggedIn, summary?.signupEvents, profileActivitiesQuery.data],
  );
}

export function useFeaturedEvents() {
  const { data: summary, isLoading } = useHomeSummary();
  const selectedLegacyIds = useSelectedActivityLegacyIds();

  const items = useMemo((): FeaturedEvent[] => {
    const homeEvents = summary?.signupEvents ?? [];
    const active = homeEvents.filter(
      (item) => getActivityStatusFromActivity(item.date, item.title) !== 'ended',
    );
    return pickHomeFeaturedEvents(active, selectedLegacyIds);
  }, [summary, selectedLegacyIds]);

  return {
    items,
    isLoading,
  };
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
      return seeded ? withCatalogActivityImage(seeded) : null;
    },
    enabled,
    staleTime: STALE_ACTIVITY_DETAIL_MS,
  });
}

/** Persist activity selection server-side and refresh profile caches. */
export async function registerForActivityAndInvalidate(legacyId: number) {
  const result = await registerForActivity(legacyId);
  patchActivitySelectionInCaches({
    legacyId,
    attendees: result.attendees,
    going: true,
  });
  const patched = patchProfileSummaryOnSelection({
    isNewSelection: !result.alreadyRegistered,
  });
  if (!patched) {
    try {
      await invalidateProfileSummary();
    } catch {
      // Selection succeeded; cache refresh is best-effort.
    }
  }
  return result;
}

export async function updateCurrentUserAndInvalidate(
  payload: UpdateCurrentUserPayload,
) {
  const user = await updateCurrentUser(payload);
  await Promise.all([invalidateUser(), invalidateProfile()]);
  return user;
}
