import Taro from '@tarojs/taro';
import type { CurrentUser } from '../types/backend';

const ACCESS_TOKEN_KEY = 'sync_access_token';
const AUTH_USER_KEY = 'sync_auth_user';
const SKIP_AUTO_LOGIN_KEY = 'sync_skip_auto_login';

function readStorage(key: string): string | null {
  try {
    const value = Taro.getStorageSync(key);
    return typeof value === 'string' && value.trim() ? value.trim() : null;
  } catch {
    return null;
  }
}

export function getAccessToken(): string | null {
  return readStorage(ACCESS_TOKEN_KEY);
}

export function getAuthUser(): CurrentUser | null {
  const raw = readStorage(AUTH_USER_KEY);
  if (!raw) return null;
  try {
    const parsed = JSON.parse(raw) as CurrentUser;
    return parsed?.id ? parsed : null;
  } catch {
    return null;
  }
}

export function getAuthUserId(): string | null {
  return getAuthUser()?.id ?? null;
}

function decodeJwtSub(token: string): string | null {
  const segment = token.split('.')[1];
  if (!segment) return null;
  try {
    const normalized = segment.replace(/-/g, '+').replace(/_/g, '/');
    const padded = normalized.padEnd(
      normalized.length + ((4 - (normalized.length % 4)) % 4),
      '=',
    );
    const json = JSON.parse(atob(padded)) as { sub?: string };
    const sub = json.sub?.trim();
    return sub || null;
  } catch {
    return null;
  }
}

/** JWT `sub` when profile cache is missing — keeps COS path aligned with verify. */
export function getResolvedAuthUserId(): string | null {
  return getAuthUserId() ?? decodeJwtSub(getAccessToken() ?? '') ?? null;
}

export function getAuthUserName(): string | null {
  return getAuthUser()?.name ?? null;
}

export function getAuthHeaders(): Record<string, string> {
  const token = getAccessToken();
  if (!token) return {};
  return { Authorization: `Bearer ${token}` };
}

export function saveAuthStorage(accessToken: string, user: CurrentUser): void {
  try {
    Taro.setStorageSync(ACCESS_TOKEN_KEY, accessToken);
    Taro.setStorageSync(AUTH_USER_KEY, JSON.stringify(user));
  } catch {
    // storage full or unavailable
  }
}

export function clearAuthStorage(): void {
  try {
    Taro.removeStorageSync(ACCESS_TOKEN_KEY);
    Taro.removeStorageSync(AUTH_USER_KEY);
  } catch {
    // ignore
  }
}

export function isLoggedIn(): boolean {
  return Boolean(getAccessToken() && getAuthUser());
}

/** After explicit logout, skip silent wx.login until user signs in again. */
export function markSkipAutoLogin(): void {
  try {
    Taro.setStorageSync(SKIP_AUTO_LOGIN_KEY, '1');
  } catch {
    // ignore
  }
}

export function clearSkipAutoLogin(): void {
  try {
    Taro.removeStorageSync(SKIP_AUTO_LOGIN_KEY);
  } catch {
    // ignore
  }
}

export function shouldSkipAutoLogin(): boolean {
  try {
    return Taro.getStorageSync(SKIP_AUTO_LOGIN_KEY) === '1';
  } catch {
    return false;
  }
}
