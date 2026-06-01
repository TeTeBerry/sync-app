import { useMemo } from 'react';
import { isApiEnabled } from '../constants/api';
import { profileUser } from '../components/profile';
import { useProfileSummaryQuery } from './useSyncApi';

/** Profile summary from API with mock fallback (same as profile page). */
export function useResolvedProfile() {
  const summaryQuery = useProfileSummaryQuery();
  const apiEnabled = isApiEnabled();

  return useMemo(
    () => (apiEnabled && summaryQuery.data ? summaryQuery.data : profileUser),
    [apiEnabled, summaryQuery.data],
  );
}
