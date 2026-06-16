import { isLiveApi } from '../../constants/api';
import { isLoggedIn } from '../../utils/authStorage';
import { fetchCurrentUser } from '../../api/sync/users';
import { fetchProfileActivities, fetchProfileSummary } from '../../api/sync/profile';
import { persistProfileSummary } from '../../utils/homeCacheStorage';
import { useApiQuery } from '../useApiQuery';
import type { QueryEnableOptions } from './types';

function profileApiEnabled(): boolean {
  return isLiveApi() && isLoggedIn();
}

export function useCurrentUserQuery(options?: QueryEnableOptions) {
  const tabEnabled = options?.enabled ?? true;
  const enabled = profileApiEnabled() && tabEnabled;

  return useApiQuery({
    queryKey: ['users', 'me'],
    queryFn: fetchCurrentUser,
    enabled,
    staleTime: 60_000,
  });
}

export function useProfileSummaryQuery() {
  const enabled = profileApiEnabled();

  return useApiQuery({
    queryKey: ['profile', 'summary'],
    queryFn: async () => {
      const summary = await fetchProfileSummary();
      persistProfileSummary(summary);
      return summary;
    },
    enabled,
    staleTime: 60_000,
  });
}

export function useProfileActivitiesQuery(options?: QueryEnableOptions) {
  const tabEnabled = options?.enabled ?? true;
  const enabled = profileApiEnabled() && tabEnabled;

  return useApiQuery({
    queryKey: ['profile', 'activities'],
    queryFn: fetchProfileActivities,
    enabled,
    staleTime: 60_000,
  });
}
