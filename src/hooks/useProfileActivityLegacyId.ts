import { useMemo } from "react";
import { useNavigationStore } from "../stores";
import { useProfileActivitiesQuery } from "./useSyncApi";

/**
 * Activity scope for per-event package entitlements.
 * Priority: navigation store `activeActivityLegacyId` (event detail / AI / map)
 * → first `registered` profile activity → first profile activity.
 * Does not default to demo seed activity — paid quotas apply only where purchased.
 */
export function useProfileActivityLegacyId(): number | undefined {
  const activeActivityLegacyId = useNavigationStore(
    (state) => state.activeActivityLegacyId,
  );
  const activitiesQuery = useProfileActivitiesQuery();

  return useMemo(() => {
    if (activeActivityLegacyId != null && !Number.isNaN(activeActivityLegacyId)) {
      return activeActivityLegacyId;
    }

    const activities = activitiesQuery.data;
    if (!activities?.length) {
      return undefined;
    }

    const registered = activities.find((item) => item.status === "registered");
    const pick = registered ?? activities[0];
    const legacyId = Number(pick.id);
    return Number.isNaN(legacyId) ? undefined : legacyId;
  }, [activeActivityLegacyId, activitiesQuery.data]);
}
