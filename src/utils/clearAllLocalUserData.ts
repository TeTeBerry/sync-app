import Taro from '@tarojs/taro';
import { apiPost } from './apiClient';
import { isApiEnabled } from '../constants/api';
import { clearAllApiCache } from '../hooks/useApiQuery';
import { clearAiChatEphemeralState } from './aiChatEphemeral';
import { notifyAuthSessionChange } from './authSession';
import { getAccessToken } from './authStorage';
import { clearClientUserCache } from './session';
import { clearUgcPublishComplianceAck } from './ugcPublishComplianceStorage';
import { ROUTES } from './route';

/**
 * Wipe all mini-program local storage and in-memory caches so the next launch
 * behaves like a first-time visitor (no token, no legal consent, no cached home).
 */
export async function clearAllLocalUserData(): Promise<void> {
  if (isApiEnabled() && getAccessToken()) {
    try {
      await apiPost<{ ok: true }>('/auth/logout', {}, undefined, {
        maxRetries: 0,
      });
    } catch {
      // Always wipe local state even when revoke fails offline.
    }
  }

  clearAiChatEphemeralState('local reset');
  clearAllApiCache();
  clearClientUserCache();

  try {
    Taro.clearStorageSync();
  } catch {
    // Fall through — memory caches are already cleared.
  }
  clearUgcPublishComplianceAck();

  notifyAuthSessionChange();

  await Taro.reLaunch({ url: ROUTES.HOME });
}
