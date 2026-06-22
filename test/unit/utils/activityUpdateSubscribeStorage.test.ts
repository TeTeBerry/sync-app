import { beforeEach, describe, expect, it, vi } from 'vitest';

const storage: Record<string, unknown> = {};

vi.mock('@tarojs/taro', () => ({
  default: {
    getStorageSync: (key: string) => storage[key],
    setStorageSync: (key: string, value: unknown) => {
      storage[key] = value;
    },
    ENV_TYPE: {
      WEAPP: 'WEAPP',
      WEB: 'WEB',
    },
    getEnv: vi.fn(() => 'WEAPP'),
    requestSubscribeMessage: vi.fn(),
  },
}));

vi.mock('@/utils/authStorage', () => ({
  getAuthUserId: vi.fn(() => 'user-1'),
}));

import {
  clearActivityUpdateSubscribedLocally,
  isActivityUpdateSubscribedLocally,
  markActivityUpdateSubscribedLocally,
} from '@/utils/activityUpdateSubscribeStorage';

describe('activityUpdateSubscribeStorage', () => {
  beforeEach(() => {
    for (const key of Object.keys(storage)) {
      delete storage[key];
    }
  });

  it('tracks subscribed activities per user', () => {
    expect(isActivityUpdateSubscribedLocally(8)).toBe(false);

    markActivityUpdateSubscribedLocally(8);
    expect(isActivityUpdateSubscribedLocally(8)).toBe(true);
    expect(isActivityUpdateSubscribedLocally(9)).toBe(false);
  });

  it('clears subscribed activity for current user', () => {
    markActivityUpdateSubscribedLocally(8);
    markActivityUpdateSubscribedLocally(9);
    clearActivityUpdateSubscribedLocally(8);
    expect(isActivityUpdateSubscribedLocally(8)).toBe(false);
    expect(isActivityUpdateSubscribedLocally(9)).toBe(true);
  });
});
