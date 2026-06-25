import { clearPersonalityTestResult } from '@/domains/personality-test/utils/personalityTestStorage';
import { clearAuthStorage, markSkipAutoLogin } from '../utils/authStorage';
import { notifyAuthSessionChange } from '../utils/authSession';
import { clearSessionCaches } from '../utils/homeCacheStorage';
import { clearClientUserCache } from '../utils/session';
import { showAppToast } from '@/utils/appToast';

let handlingUnauthorized = false;

/** Clear session and notify UI when an authenticated request returns 401. */
export function handleApiUnauthorized(message?: string): void {
  if (handlingUnauthorized) {
    return;
  }
  handlingUnauthorized = true;
  try {
    clearSessionCaches();
    clearAuthStorage();
    markSkipAutoLogin();
    clearPersonalityTestResult();
    clearClientUserCache();
    notifyAuthSessionChange();
    const trimmed = message?.trim();
    if (trimmed) {
      showAppToast(trimmed, { raw: true, icon: 'none' });
    } else {
      showAppToast('common.sessionExpired', { icon: 'none' });
    }
  } finally {
    handlingUnauthorized = false;
  }
}
