import { beforeEach, describe, expect, it, vi } from 'vitest';

const storage: Record<string, unknown> = {};

vi.mock('@tarojs/taro', () => ({
  default: {
    getStorageSync: (key: string) => storage[key],
    setStorageSync: (key: string, value: unknown) => {
      storage[key] = value;
    },
    removeStorageSync: (key: string) => {
      delete storage[key];
    },
  },
}));

import {
  clearNewUserOnboardingSeen,
  hasSeenNewUserOnboarding,
  markNewUserOnboardingSeen,
} from '@/utils/onboardingStorage';

describe('onboardingStorage', () => {
  beforeEach(() => {
    clearNewUserOnboardingSeen();
  });

  it('returns false before onboarding is marked seen', () => {
    expect(hasSeenNewUserOnboarding()).toBe(false);
  });

  it('marks onboarding as seen', () => {
    markNewUserOnboardingSeen();
    expect(hasSeenNewUserOnboarding()).toBe(true);
  });

  it('clears seen flag', () => {
    markNewUserOnboardingSeen();
    clearNewUserOnboardingSeen();
    expect(hasSeenNewUserOnboarding()).toBe(false);
  });
});
