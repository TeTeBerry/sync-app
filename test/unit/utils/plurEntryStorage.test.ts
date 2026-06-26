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
  markNewUserOnboardingSeen,
} from '@/utils/onboardingStorage';
import {
  clearPlurEntrySeen,
  hasSeenPlurEntry,
  markPlurEntrySeen,
} from '@/utils/plurEntryStorage';

describe('plurEntryStorage', () => {
  beforeEach(() => {
    clearPlurEntrySeen();
    clearNewUserOnboardingSeen();
  });

  it('returns false before plur entry is marked seen', () => {
    expect(hasSeenPlurEntry()).toBe(false);
  });

  it('marks plur entry as seen', () => {
    markPlurEntrySeen();
    expect(hasSeenPlurEntry()).toBe(true);
  });

  it('clears seen flag', () => {
    markPlurEntrySeen();
    clearPlurEntrySeen();
    expect(hasSeenPlurEntry()).toBe(false);
  });

  it('treats completed onboarding as plur entry seen (migration)', () => {
    markNewUserOnboardingSeen();
    expect(hasSeenPlurEntry()).toBe(true);
  });
});
