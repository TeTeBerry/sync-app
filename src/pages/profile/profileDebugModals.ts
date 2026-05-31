import type { FreeMonthlyQuota, PackageTierId } from "../../types/backend";

/** Realistic free-tier monthly quota with contact unlock exhausted (Pro upgrade path). */
export function buildDebugContactUnlockExhaustedPreview(): {
  currentPaidTierId: PackageTierId | null;
  freeMonthly: FreeMonthlyQuota;
} {
  return {
    currentPaidTierId: null,
    freeMonthly: {
      period: "2026-06",
      aiMatch: { limit: 3, used: 2, remaining: 1 },
      contactUnlock: { limit: 3, used: 3, remaining: 0 },
    },
  };
}
