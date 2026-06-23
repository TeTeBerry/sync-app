import { useMemo } from 'react';
import { loadActivityPerformanceBundle } from '@/utils/activityPerformanceBundleStorage';
import { useNetworkStatus } from './useNetworkStatus';

export function useActivityPerformanceBundleOffline(
  activityLegacyId: number,
  options: { queryFailed: boolean },
) {
  const { isConnected } = useNetworkStatus();
  const loaded = useMemo(() => {
    if (!Number.isFinite(activityLegacyId) || activityLegacyId <= 0) {
      return undefined;
    }
    return loadActivityPerformanceBundle(activityLegacyId);
  }, [activityLegacyId]);

  const isOfflineBundle = !isConnected && options.queryFailed && loaded != null;

  return {
    isConnected,
    isOfflineBundle,
    bundleSavedAt: loaded?.savedAt,
    bundle: loaded?.bundle,
  };
}
