import { beforeEach, describe, expect, it, vi } from 'vitest';

const storage = new Map<string, unknown>();

vi.mock('@tarojs/taro', () => ({
  default: {
    getStorageSync: (key: string) => storage.get(key),
    setStorageSync: (key: string, value: unknown) => {
      storage.set(key, value);
    },
    removeStorageSync: (key: string) => {
      storage.delete(key);
    },
  },
}));

import {
  isPlurRespectConfirmed,
  setPlurRespectConfirmed,
} from '@/utils/plurRespectConfirm.storage';

describe('plurRespectConfirm.storage', () => {
  beforeEach(() => {
    storage.clear();
  });

  it('returns false when not confirmed', () => {
    expect(isPlurRespectConfirmed()).toBe(false);
  });

  it('persists confirmed state', () => {
    setPlurRespectConfirmed(true);
    expect(isPlurRespectConfirmed()).toBe(true);
  });

  it('clears confirmed state', () => {
    setPlurRespectConfirmed(true);
    setPlurRespectConfirmed(false);
    expect(isPlurRespectConfirmed()).toBe(false);
  });
});
