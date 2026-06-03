import { useMemo } from 'react';
import { normalizeProfileUserData } from '../components/profile/profileSummaryUtils';
import type { ProfileSummary } from '../types/backend';
import { useProfileSummaryQuery } from './useSyncApi';

/** Profile summary from API (empty skeleton while loading). */
export function useResolvedProfile() {
  const summaryQuery = useProfileSummaryQuery();

  return useMemo(
    () => normalizeProfileUserData((summaryQuery.data ?? {}) as ProfileSummary),
    [summaryQuery.data],
  );
}
