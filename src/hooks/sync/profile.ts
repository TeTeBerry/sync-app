import { isLiveApi } from '../../constants/api';
import { isLoggedIn } from '../../utils/authStorage';
import { fetchCurrentUser } from '../../api/sync/users';
import {
  fetchProfileActivities,
  fetchProfilePosts,
  fetchProfileSummary,
} from '../../api/sync/profile';
import { filterProfileTeamPosts } from '../../utils/profileTeamPosts';
import { invalidateProfileSummary } from '../../utils/queryInvalidation';
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
    queryFn: fetchProfileSummary,
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

export function useProfilePostsQuery() {
  const enabled = profileApiEnabled();

  return useApiQuery({
    queryKey: ['profile', 'posts'],
    queryFn: async () => filterProfileTeamPosts(await fetchProfilePosts()),
    enabled,
    staleTime: 30_000,
  });
}

export async function refreshProfileSummary() {
  await invalidateProfileSummary();
}
