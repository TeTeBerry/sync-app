import { isAuthSessionExpiredMessage } from '../constants/authMessages';

/** When true, caller should clear session via `handleApiUnauthorized`. */
export function shouldClearSessionOnWsError(message?: string | null): boolean {
  return isAuthSessionExpiredMessage(message);
}
