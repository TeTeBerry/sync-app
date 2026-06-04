import Taro from '@tarojs/taro';
import { apiPost } from './apiClient';
import type { AuthLoginResult } from '../types/backend';
import { isApiEnabled } from '../constants/api';
import { clearClientUserCache, persistUserName } from './session';
import {
  clearAuthStorage,
  clearSkipAutoLogin,
  getAccessToken,
  getAuthUser,
  getAuthUserId,
  getAuthUserName,
  getAuthHeaders,
  isLoggedIn,
  markSkipAutoLogin,
  saveAuthStorage,
  shouldSkipAutoLogin,
} from './authStorage';
import { notifyAuthSessionChange } from './authSession';
import { clearHomeCachesOnLogout } from './homeCacheStorage';
import { hasLegalConsent } from './legalConsentStorage';

export {
  getAccessToken,
  getAuthUser,
  getAuthUserId,
  getAuthUserName,
  getAuthHeaders,
  isLoggedIn,
};

let loginPromise: Promise<AuthLoginResult | null> | null = null;

function saveAuthResult(result: AuthLoginResult): void {
  clearSkipAutoLogin();
  saveAuthStorage(result.accessToken, result.user);
  persistUserName(result.user.name);
  clearClientUserCache();
  notifyAuthSessionChange();
}

export function clearAuth(): void {
  clearAuthStorage();
  clearClientUserCache();
  markSkipAutoLogin();
  notifyAuthSessionChange();
}

export type WechatProfileInput = {
  nickName?: string;
  avatarUrl?: string;
};

/** Requires user tap; call from login button handler only. */
export async function getWechatUserProfile(): Promise<WechatProfileInput | null> {
  if (process.env.TARO_ENV !== 'weapp') {
    return null;
  }

  try {
    const res = await Taro.getUserProfile({
      desc: '用于展示个人主页头像与昵称',
    });
    const nickName = res.userInfo?.nickName?.trim();
    const avatarUrl = res.userInfo?.avatarUrl?.trim();
    if (!nickName && !avatarUrl) {
      return null;
    }
    return { nickName, avatarUrl };
  } catch {
    return null;
  }
}

export type LoginWithWechatOptions = {
  /** When true, prompts getUserProfile and requires nickName (button login). */
  requireProfile?: boolean;
  profile?: WechatProfileInput | null;
};

export async function loginWithWechat(
  options: LoginWithWechatOptions = {},
): Promise<AuthLoginResult> {
  const requireProfile = options.requireProfile ?? false;
  let profile = options.profile;

  if (process.env.TARO_ENV === 'weapp' && requireProfile && profile === undefined) {
    profile = await getWechatUserProfile();
    if (!profile?.nickName?.trim()) {
      throw new Error('请授权微信头像与昵称后继续登录');
    }
  }

  const loginRes = await Taro.login();
  const code = loginRes.code?.trim();
  if (!code) {
    throw new Error('微信登录失败，未获取到 code');
  }

  const body: {
    code: string;
    nickName?: string;
    avatarUrl?: string;
  } = { code };
  if (profile?.nickName?.trim()) {
    body.nickName = profile.nickName.trim();
  }
  if (profile?.avatarUrl?.trim()) {
    body.avatarUrl = profile.avatarUrl.trim();
  }

  const result = await apiPost<AuthLoginResult>('/auth/wechat', body, undefined, {
    maxRetries: 0,
  });
  saveAuthResult(result);
  return result;
}

export async function loginWithDev(displayName?: string): Promise<AuthLoginResult> {
  const result = await apiPost<AuthLoginResult>(
    '/auth/dev',
    displayName?.trim() ? { displayName: displayName.trim() } : {},
    undefined,
    { maxRetries: 0 },
  );
  saveAuthResult(result);
  return result;
}

/** Silent login on app launch when API is enabled (skipped after explicit logout). */
export async function ensureAuth(): Promise<AuthLoginResult | null> {
  if (!isApiEnabled()) return null;

  const token = getAccessToken();
  const user = getAuthUser();
  if (token && user) {
    return { accessToken: token, user };
  }

  if (shouldSkipAutoLogin()) {
    return null;
  }

  if (process.env.TARO_ENV === 'weapp' && !hasLegalConsent()) {
    return null;
  }

  if (!loginPromise) {
    loginPromise = (async () => {
      try {
        if (process.env.TARO_ENV === 'weapp') {
          return await loginWithWechat({ requireProfile: false });
        }
        if (process.env.TARO_APP_AUTH_DEV === 'true') {
          return await loginWithDev(process.env.TARO_APP_DEV_USER_NAME || '开发用户');
        }
        return null;
      } finally {
        loginPromise = null;
      }
    })();
  }

  return loginPromise;
}

export async function logout(): Promise<void> {
  if (isApiEnabled() && getAccessToken()) {
    try {
      await apiPost<{ ok: true }>('/auth/logout', {}, undefined, {
        maxRetries: 0,
      });
    } catch {
      // Always clear local session even when revoke fails (offline / expired token).
    }
  }
  clearHomeCachesOnLogout();
  clearAuth();
}
