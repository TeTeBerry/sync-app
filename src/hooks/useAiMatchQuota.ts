import { useMemo } from 'react';
import { isApiEnabled } from '../constants/api';
import { isProfileBenefitsEnabled } from '../constants/featureFlags';
import { useProfileActivityLegacyId } from './useProfileActivityLegacyId';
import { useProfileEntitlementsQuery } from './useSyncApi';
import {
  isAiMatchQuotaExhausted,
  resolveProfileEntitlement,
} from '../utils/profileEntitlement';
import type { EventPackageEntitlement } from '../types/backend';

export type AiMatchQuotaDisplay = {
  exhausted: boolean;
  remaining: number | null;
  limit: number | null;
  used: number;
  /** e.g. "10/10" for in-chat copy */
  usageLabel: string;
  loading: boolean;
};

function buildUsageLabel(entitlement: EventPackageEntitlement | null): string {
  if (!entitlement) return '0/0';
  const { used, limit } = entitlement.quotas.aiMatch;
  if (limit == null) return `${used}/∞`;
  return `${used}/${limit}`;
}

/**
 * AI match quota for the active activity scope (entitlements API).
 * `exhausted` is false while loading or when API is disabled.
 */
export function useAiMatchQuota(): AiMatchQuotaDisplay {
  const activityLegacyId = useProfileActivityLegacyId();
  const entitlementsQuery = useProfileEntitlementsQuery(activityLegacyId);

  return useMemo(() => {
    const loading = isApiEnabled() && entitlementsQuery.isLoading;

    if (!isApiEnabled() || !isProfileBenefitsEnabled()) {
      return {
        exhausted: false,
        remaining: null,
        limit: null,
        used: 0,
        usageLabel: '0/0',
        loading: false,
      };
    }

    const entitlement = resolveProfileEntitlement(
      entitlementsQuery.data,
      activityLegacyId,
    );
    const slot = entitlement?.quotas.aiMatch;
    const remaining = slot?.remaining ?? null;
    const limit = slot?.limit ?? null;
    const used = slot?.used ?? 0;

    return {
      exhausted: !loading && isAiMatchQuotaExhausted(entitlement),
      remaining,
      limit,
      used,
      usageLabel: buildUsageLabel(entitlement),
      loading,
    };
  }, [activityLegacyId, entitlementsQuery.data, entitlementsQuery.isLoading]);
}
