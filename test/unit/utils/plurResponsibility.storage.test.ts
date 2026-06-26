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
  countPlurrResponsibilityChecked,
  loadPlurrResponsibility,
  togglePlurrResponsibilityItem,
} from '@/utils/plurResponsibility.storage';

describe('plurResponsibility.storage', () => {
  beforeEach(() => {
    storage.clear();
  });

  it('returns empty state for invalid activity id', () => {
    const state = loadPlurrResponsibility(0);
    expect(countPlurrResponsibilityChecked(state)).toBe(0);
    expect(state.hydration).toBe(false);
  });

  it('toggles item and persists per activity', () => {
    const next = togglePlurrResponsibilityItem(42, 'hydration');
    expect(next.hydration).toBe(true);
    expect(countPlurrResponsibilityChecked(next)).toBe(1);

    const reloaded = loadPlurrResponsibility(42);
    expect(reloaded.hydration).toBe(true);
    expect(reloaded.tell_someone).toBe(false);
  });

  it('scopes storage by activity id', () => {
    togglePlurrResponsibilityItem(1, 'hydration');
    togglePlurrResponsibilityItem(2, 'tell_someone');

    expect(loadPlurrResponsibility(1).hydration).toBe(true);
    expect(loadPlurrResponsibility(1).tell_someone).toBe(false);
    expect(loadPlurrResponsibility(2).tell_someone).toBe(true);
    expect(loadPlurrResponsibility(2).hydration).toBe(false);
  });

  it('untoggles checked item', () => {
    togglePlurrResponsibilityItem(7, 'exit_plan');
    const next = togglePlurrResponsibilityItem(7, 'exit_plan');
    expect(next.exit_plan).toBe(false);
    expect(countPlurrResponsibilityChecked(next)).toBe(0);
  });
});
