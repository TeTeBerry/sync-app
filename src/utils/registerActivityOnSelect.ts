import { isApiEnabled } from '@/constants/api';
import { registerForActivityAndInvalidate } from '@/hooks/sync/activities';
import { isLoggedIn } from '@/utils/authStorage';

/** Persist activity selection when the user binds an activity (no toast). */
export function registerActivityOnSelectSilently(legacyId: number): void {
  if (!isLoggedIn() || !isApiEnabled()) return;
  if (!Number.isFinite(legacyId) || legacyId <= 0) return;
  void registerForActivityAndInvalidate(legacyId).catch(() => undefined);
}
