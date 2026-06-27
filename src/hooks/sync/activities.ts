import { useEffect, useMemo, useRef } from 'react';
import {
  fetchActivities,
  fetchActivityByLegacyId,
  fetchActivitiesByLineupArtistId,
  fetchCatalogLineupArtistDetail,
  fetchCatalogLineupArtists,
  fetchHomeSummary,
  registerForActivity,
  unregisterForActivity,
  optInWechatActivityUpdates,
} from '../../api/sync/activities';
import { isLiveApi } from '../../constants/api';
import { isLoggedIn } from '../../utils/authStorage';
import { subscribeAuthSessionChange } from '../../utils/authSession';
import type { BackendActivity } from '../../types/backend';
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
import {
  afterActivitiesListCommitted,
  afterHomeSummaryCommitted,
} from '../../utils/homeCacheStorage';
import {
  patchActivitySelectionInCaches,
  patchProfileSummaryOnSelection,
  patchProfileSummaryOnUnregister,
} from '../../cache/activityCache';
import {
  invalidateProfileSummary,
  invalidateProfile,
} from '../../utils/queryInvalidation';
import {
  broadcastCacheData,
  getCacheData,
  setCacheData,
  useApiQuery,
} from '../useApiQuery';
import { syncBuddyMatchProfileFromUser } from '../../stores/buddyMatchProfileStore';
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
      afterActivitiesListCommitted(activities);
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

export function useCatalogLineupArtistDetail(
  artistId: string | null | undefined,
  options?: QueryEnableOptions,
) {
  const tabEnabled = options?.enabled ?? true;
  const id = artistId?.trim() ?? '';

  return useApiQuery({
    queryKey: ['artists', 'detail', id],
    queryFn: () => fetchCatalogLineupArtistDetail(id),
    enabled: isLiveApi() && tabEnabled && id.length > 0,
    staleTime: STALE_ACTIVITIES_LIST_MS,
  });
}

export function useLineupArtistActivities(
  lineupArtistId: string | null | undefined,
  options?: QueryEnableOptions,
) {
  const tabEnabled = options?.enabled ?? true;
  const id = lineupArtistId?.trim() ?? '';

  return useApiQuery({
    queryKey: ['activities', 'by-lineup-artist', id],
    queryFn: async () => {
      const activities = await fetchActivitiesByLineupArtistId(id);
      return activities.map(withCatalogActivityImage);
    },
    enabled: isLiveApi() && tabEnabled && id.length > 0,
    staleTime: STALE_ACTIVITIES_LIST_MS,
  });
}

export function useHomeSummary() {
  const query = useApiQuery({
    queryKey: ['home', 'summary'],
    queryFn: async () => {
      const result = withCatalogHomeSummary(await fetchHomeSummary());
      afterHomeSummaryCommitted(result);
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
  const { data: summary, isLoading, isError, refetch } = useHomeSummary();
  const selectedLegacyIds = useSelectedActivityLegacyIds();

  const items = useMemo((): FeaturedEvent[] => {
    const homeEvents = summary?.signupEvents ?? [];
    const active = homeEvents.filter(
      (item) => getActivityStatusFromActivity(item.date, item.title) !== 'ended',
    );
    return pickHomeFeaturedEvents(active, selectedLegacyIds);
  }, [summary, selectedLegacyIds]);

  const hasSummary = summary !== undefined;

  return {
    items,
    isLoading: isLoading && !hasSummary,
    isError: isError && !hasSummary,
    refetch,
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

/** Record WeChat subscribe consent for activity update pushes. */
export async function optInWechatActivityUpdatesAndInvalidate(legacyId: number) {
  return optInWechatActivityUpdates(legacyId);
}

/** Remove activity registration and refresh profile/home caches. */
export async function unregisterForActivityAndInvalidate(legacyId: number) {
  const result = await unregisterForActivity(legacyId);
  patchActivitySelectionInCaches({
    legacyId,
    attendees: result.attendees,
    going: false,
  });
  if (result.wasRegistered) {
    const patched = patchProfileSummaryOnUnregister();
    if (!patched) {
      try {
        await invalidateProfileSummary();
      } catch {
        // Unregister succeeded; cache refresh is best-effort.
      }
    }
  }
  return result;
}

export async function updateCurrentUserAndInvalidate(
  payload: UpdateCurrentUserPayload,
) {
  const user = await updateCurrentUser(payload);
  setCacheData(['users', 'me'], () => user);
  syncBuddyMatchProfileFromUser(user);
  broadcastCacheData(['users', 'me']);
  await invalidateProfile();
  return user;
}
