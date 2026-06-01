import { beforeEach, describe, expect, it, vi } from 'vitest';

const storage = new Map<string, string>();

vi.mock('@tarojs/taro', () => ({
  default: {
    getStorageSync: (key: string) => storage.get(key) ?? '',
    setStorageSync: (key: string, value: string) => {
      storage.set(key, value);
    },
    removeStorageSync: (key: string) => {
      storage.delete(key);
    },
  },
}));

import {
  clearSkipAutoLogin,
  getAccessToken,
  getAuthUser,
  isLoggedIn,
  markSkipAutoLogin,
  saveAuthStorage,
  shouldSkipAutoLogin,
} from './authStorage';

describe('authStorage skip auto login', () => {
  beforeEach(() => {
    storage.clear();
  });

  it('shouldSkipAutoLogin is false by default', () => {
    expect(shouldSkipAutoLogin()).toBe(false);
  });

  it('markSkipAutoLogin persists until cleared', () => {
    markSkipAutoLogin();
    expect(shouldSkipAutoLogin()).toBe(true);
    clearSkipAutoLogin();
    expect(shouldSkipAutoLogin()).toBe(false);
  });

  it('isLoggedIn requires token and user id', () => {
    expect(isLoggedIn()).toBe(false);
    saveAuthStorage('token-abc', {
      id: 'user-1',
      name: 'Test User',
    });
    expect(getAccessToken()).toBe('token-abc');
    expect(getAuthUser()?.id).toBe('user-1');
    expect(isLoggedIn()).toBe(true);
  });
});
