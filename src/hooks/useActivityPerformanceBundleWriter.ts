import { useEffect } from 'react';
import { commitActivityPerformanceBundle } from '../utils/activityPerformanceBundleStorage';
import { isWifiPreferredForPrefetch } from '../utils/networkPreference';
import type {
  BackendActivity,
  ItineraryScheduleSnapshot,
  SavedItineraryResult,
} from '../types/backend';

type PerformanceBundleWriterPayload = {
  activity?: BackendActivity | null;
  schedule?: ItineraryScheduleSnapshot;
  savedItinerary?: SavedItineraryResult;
};

/** Silently persist activity performance bundle on Wi‑Fi when API data is available. */
export function useActivityPerformanceBundleWriter(
  activityLegacyId: number | undefined,
  payload: PerformanceBundleWriterPayload,
) {
  const { activity, schedule, savedItinerary } = payload;

  useEffect(() => {
    if (
      activityLegacyId == null ||
      !Number.isFinite(activityLegacyId) ||
      activityLegacyId <= 0
    ) {
      return;
    }

    const hasData = activity != null || schedule != null || savedItinerary != null;
    if (!hasData) {
      return;
    }

    void (async () => {
      if (!(await isWifiPreferredForPrefetch())) {
        return;
      }
      commitActivityPerformanceBundle({
        activityLegacyId,
        activity,
        schedule,
        savedItinerary,
      });
    })();
  }, [activity, activityLegacyId, savedItinerary, schedule]);
}
