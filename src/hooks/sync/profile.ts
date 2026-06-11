import { isLiveApi } from '../../constants/api';
import { isLoggedIn } from '../../utils/authStorage';
import { fetchCurrentUser } from '../../api/sync/users';
import {
  consumeProfileContactUnlock,
  fetchProfileActivities,
  fetchProfileEntitlements,
  fetchProfilePackages,
  fetchProfilePosts,
  fetchProfileSummary,
  purchaseProfilePackage,
} from '../../api/sync/profile';
import type { PurchaseProfilePackagePayload } from '../../types/backend';
import { filterProfileTeamPosts } from '../../utils/profileTeamPosts';
import {
  invalidateProfileEntitlements,
  invalidateProfilePackageState,
} from '../../utils/queryInvalidation';
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

export function useProfileSummaryQuery(activityLegacyId?: number) {
  const enabled = profileApiEnabled();
  const scopedId =
    activityLegacyId != null && !Number.isNaN(activityLegacyId)
      ? activityLegacyId
      : undefined;

  return useApiQuery({
    queryKey: ['profile', 'summary', scopedId ?? 'all'],
    queryFn: () => fetchProfileSummary(scopedId),
    enabled,
    staleTime: 60_000,
  });
}

export function useProfilePackagesQuery() {
  const enabled = profileApiEnabled();

  return useApiQuery({
    queryKey: ['profile', 'packages'],
    queryFn: fetchProfilePackages,
    enabled,
    staleTime: 300_000,
  });
}

export function useProfileEntitlementsQuery(
  activityLegacyId?: number,
  options?: QueryEnableOptions,
) {
  const tabEnabled = options?.enabled ?? true;
  const enabled = profileApiEnabled() && tabEnabled;
  const scopedId =
    activityLegacyId != null && !Number.isNaN(activityLegacyId)
      ? activityLegacyId
      : undefined;

  return useApiQuery({
    queryKey: ['profile', 'entitlements', scopedId ?? 'all'],
    queryFn: () => fetchProfileEntitlements(scopedId),
    enabled,
    staleTime: 30_000,
  });
}

export async function purchaseProfilePackageAndInvalidate(
  payload: PurchaseProfilePackagePayload,
) {
  const result = await purchaseProfilePackage(payload);
  await invalidateProfilePackageState();
  return result;
}

export async function consumeProfileContactUnlockAndInvalidate(
  activityLegacyId: number,
) {
  if (Number.isNaN(activityLegacyId)) {
    throw new Error('activityLegacyId is required');
  }
  const result = await consumeProfileContactUnlock({ activityLegacyId });
  await invalidateProfileEntitlements();
  return result;
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
