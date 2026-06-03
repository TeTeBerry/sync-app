import { consumeProfileContactUnlock } from '../api/syncApi';
import { isLiveApi } from '../constants/api';
import { invalidateProfileEntitlements } from './queryInvalidation';

/**
 * Consumes one contact-unlock quota (free monthly first, then paid per-event).
 * Returns false when API is disabled or quota is exhausted.
 *
 * Used when applying to join a team post and when revealing contact on map / user sheets.
 */
export async function consumeContactUnlockWithQuota(
  activityLegacyId: number,
): Promise<boolean> {
  if (!isLiveApi()) {
    return true;
  }

  if (activityLegacyId == null || Number.isNaN(activityLegacyId)) {
    return false;
  }

  try {
    await consumeProfileContactUnlock({ activityLegacyId });
    await invalidateProfileEntitlements();
    return true;
  } catch {
    await invalidateProfileEntitlements();
    return false;
  }
}
