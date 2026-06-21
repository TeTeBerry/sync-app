import { beforeEach, describe, expect, it, vi } from 'vitest';
import { bindActivity, getActiveActivityLegacyId } from '@/domains/activity-scope';
import { useNavigationStore } from '@/stores/navigationStore';

vi.mock('@tarojs/taro', () => ({
  default: {
    showToast: vi.fn(),
  },
}));

vi.mock('@/utils/registerActivityOnSelectSilently', () => ({
  registerActivityOnSelectSilently: vi.fn(),
}));

vi.mock('@/utils/activityDetailCache', () => ({
  seedActivityDetailCache: vi.fn(),
}));

describe('activityScopeService', () => {
  beforeEach(() => {
    useNavigationStore.getState().setActiveActivityLegacyId(null);
  });

  it('bindActivity writes navigation store legacy id', () => {
    expect(bindActivity(42)).toBe(true);
    expect(getActiveActivityLegacyId()).toBe(42);
  });

  it('rejects invalid legacy id', () => {
    expect(bindActivity(0)).toBe(false);
    expect(getActiveActivityLegacyId()).toBeNull();
  });
});
