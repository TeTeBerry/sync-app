import {
  useLoginInterceptStore,
  type LoginInterceptFeature,
} from '../stores/loginInterceptStore';
import { isLoggedIn } from './authStorage';

/** No valid session — protected actions should show the login sheet (API on or off). */
export function isAuthGated(): boolean {
  return !isLoggedIn();
}

/**
 * Runs `action` immediately when auth is not required; otherwise opens the login sheet
 * and runs `action` after a successful login.
 * @returns true when `action` ran (or will run after login).
 */
export function requireAuth(
  action: () => void,
  feature: LoginInterceptFeature = 'general',
): boolean {
  if (!isAuthGated()) {
    action();
    return true;
  }
  useLoginInterceptStore.getState().show(feature, action);
  return false;
}
