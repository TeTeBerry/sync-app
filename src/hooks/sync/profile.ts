import { useRef, useEffect } from 'react';
import { useDidShow } from '@tarojs/taro';
import { isLiveApi } from '../../constants/api';
import { isLoggedIn } from '../../utils/authStorage';
import { fetchCurrentUser } from '../../api/sync/users';
import { syncBuddyMatchProfileFromUser } from '../../stores/buddyMatchProfileStore';
import {
  fetchProfileActivities,
  fetchProfilePosts,
  fetchProfileSummary,
} from '../../api/sync/profile';
import { persistProfileSummary } from '../../utils/homeCacheStorage';
import { useApiQuery } from '../useApiQuery';
import type { QueryEnableOptions } from './types';

function profileApiEnabled(): boolean {
  return isLiveApi() && isLoggedIn();
}

export function useCurrentUserQuery(options?: QueryEnableOptions) {
  const tabEnabled = options?.enabled ?? true;
  const enabled = profileApiEnabled() && tabEnabled;

  const query = useApiQuery({
    queryKey: ['users', 'me'],
    queryFn: fetchCurrentUser,
    enabled,
    staleTime: 60_000,
  });

  const enabledRef = useRef(enabled);
  enabledRef.current = enabled;

  useEffect(() => {
    syncBuddyMatchProfileFromUser(query.data);
  }, [query.data]);

  useDidShow(() => {
    if (enabledRef.current) {
      void query.refetch({ background: true });
    }
  });

  return query;
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

export function useProfilePostsQuery() {
  const enabled = profileApiEnabled();

  return useApiQuery({
    queryKey: ['profile', 'posts'],
    queryFn: async () => fetchProfilePosts(),
    enabled,
    staleTime: 30_000,
  });
}
