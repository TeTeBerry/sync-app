import { useMemo } from 'react';
import { isApiEnabled } from '../constants/api';
import { useProfileActivityLegacyId } from './useProfileActivityLegacyId';
import { useProfileEntitlementsQuery } from './useSyncApi';
import {
  getContactUnlockRemaining,
  isContactUnlockQuotaExhausted,
  resolveProfileEntitlement,
} from '../utils/profileEntitlement';

export type ContactUnlockQuotaDisplay = {
  exhausted: boolean;
  remaining: number | null;
  loading: boolean;
};

/**
 * Contact-unlock quota for the active activity scope (entitlements API).
 * `exhausted` is false while loading or when API is disabled.
 */
export function useContactUnlockQuota(
  activityLegacyIdOverride?: number,
): ContactUnlockQuotaDisplay {
  const storeActivityLegacyId = useProfileActivityLegacyId();
  const activityLegacyId = activityLegacyIdOverride ?? storeActivityLegacyId;
  const entitlementsQuery = useProfileEntitlementsQuery(activityLegacyId);

  return useMemo(() => {
    const loading = isApiEnabled() && entitlementsQuery.isLoading;

    if (!isApiEnabled()) {
      return {
        exhausted: false,
        remaining: null,
        loading: false,
      };
    }

    const entitlement = resolveProfileEntitlement(
      entitlementsQuery.data,
      activityLegacyId,
    );
    const remaining = getContactUnlockRemaining(entitlement);

    return {
      exhausted: !loading && isContactUnlockQuotaExhausted(entitlement),
      remaining,
      loading,
    };
  }, [activityLegacyId, entitlementsQuery.data, entitlementsQuery.isLoading]);
}
