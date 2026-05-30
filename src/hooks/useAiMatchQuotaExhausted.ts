import { useAiMatchQuota } from "./useAiMatchQuota";

/**
 * Whether the user has used all AI match quota for the current activity scope.
 * Hidden while loading or when the API is disabled (mock mode).
 */
export function useAiMatchQuotaExhausted(): boolean {
  return useAiMatchQuota().exhausted;
}
