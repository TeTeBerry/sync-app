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
  seedActivityDetailCache,
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
import { persistHomeSummary, persistActivities } from '../../utils/homeCacheStorage';
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
import { parseActivityLegacyId } from '../../utils/activityLegacyId';

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

export function useFeaturedEvents() {
  const summaryQuery = useHomeSummary();
  const profileActivitiesQuery = useProfileActivitiesQuery({
    enabled: isLoggedIn(),
  });

  const registeredLegacyIds = useMemo(
    () =>
      buildRegisteredActivityLegacyIds(
        summaryQuery.data?.signupEvents,
        profileActivitiesQuery.data,
      ),
    [profileActivitiesQuery.data, summaryQuery.data?.signupEvents],
  );

  const items = useMemo((): FeaturedEvent[] => {
    const signupEvents = summaryQuery.data?.signupEvents;
    if (!signupEvents?.length) {
      return [];
    }
    return pickHomeFeaturedEvents(signupEvents, registeredLegacyIds);
  }, [registeredLegacyIds, summaryQuery.data?.signupEvents]);

  return {
    items,
    isLoading:
      summaryQuery.isLoading &&
      !summaryQuery.data &&
      (isLoggedIn() ? profileActivitiesQuery.isLoading : false),
    refetch: summaryQuery.refetch,
  };
}

export function useRegisteredActivityLegacyIds() {
  const summaryQuery = useHomeSummary();
  const profileActivitiesQuery = useProfileActivitiesQuery({
    enabled: isLoggedIn(),
  });

  return useMemo(
    () =>
      buildRegisteredActivityLegacyIds(
        summaryQuery.data?.signupEvents,
        profileActivitiesQuery.data,
      ),
    [profileActivitiesQuery.data, summaryQuery.data?.signupEvents],
  );
}

export function useActivityDetailQuery(
  legacyId: number | null | undefined,
  options?: QueryEnableOptions,
) {
  const parsedId = parseActivityLegacyId(legacyId);
  const tabEnabled = options?.enabled ?? true;
  const enabled = isLiveApi() && tabEnabled && parsedId != null;

  return useApiQuery({
    queryKey: ['activities', 'detail', parsedId ?? 'invalid'],
    queryFn: async () => {
      const activity = await fetchActivityByLegacyId(parsedId!);
      if (activity) {
        seedActivityDetailCache(withCatalogActivityImage(activity));
      }
      return activity;
    },
    enabled,
    staleTime: STALE_ACTIVITY_DETAIL_MS,
    initialData: () => {
      if (parsedId == null) return undefined;
      return getCacheData<BackendActivity | null>(['activities', 'detail', parsedId]);
    },
  });
}

export async function registerForActivityAndInvalidate(legacyId: number) {
  const result = await registerForActivity(legacyId);
  patchActivityRegistrationInCaches({
    legacyId,
    going: true,
    attendees: result.attendees,
  });
  invalidateRegistrationProfile();
  return result;
}

export async function cancelActivityRegistrationAndInvalidate(legacyId: number) {
  const result = await cancelActivityRegistration(legacyId);
  patchActivityRegistrationInCaches({
    legacyId,
    going: false,
    attendees: result.attendees,
  });
  invalidateRegistrationProfile();
  return result;
}

export async function updateCurrentUserAndInvalidate(
  payload: UpdateCurrentUserPayload,
) {
  const user = await updateCurrentUser(payload);
  invalidateUser();
  invalidateProfile();
  return user;
}

export function useActivityStatus(activity?: ActivityDateFields | null) {
  return useMemo(() => getActivityStatusFromActivity(activity), [activity]);
}

export function useHomeSummarySignupEvents(): HomeSummary['signupEvents'] {
  const { data } = useHomeSummary();
  return data?.signupEvents ?? [];
}
