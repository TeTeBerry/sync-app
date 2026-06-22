import { beforeEach, describe, expect, it, vi } from 'vitest';

const storage = new Map<string, unknown>();

vi.mock('@tarojs/taro', () => ({
  default: {
    setStorageSync: vi.fn((key: string, value: unknown) => {
      storage.set(key, value);
    }),
    getStorageSync: vi.fn((key: string) => storage.get(key)),
    removeStorageSync: vi.fn((key: string) => {
      storage.delete(key);
    }),
  },
}));

import {
  dismissTravelGuideSearchPrefill,
  markTravelGuideSearchPrefillPending,
  shouldApplyTravelGuideSearchPrefill,
} from '@/domains/travel-guide/utils/travelGuideSearchPrefillStorage';

describe('travelGuideSearchPrefillStorage', () => {
  const activityLegacyId = 42;
  const guideId = 'guide-abc';

  beforeEach(() => {
    storage.clear();
    markTravelGuideSearchPrefillPending(activityLegacyId, guideId);
  });

  it('applies prefill when pending and not dismissed', () => {
    expect(shouldApplyTravelGuideSearchPrefill(activityLegacyId, guideId)).toBe(true);
  });

  it('does not apply after dismiss for the same guide', () => {
    dismissTravelGuideSearchPrefill(activityLegacyId, guideId);
    expect(shouldApplyTravelGuideSearchPrefill(activityLegacyId, guideId)).toBe(false);
  });

  it('does not apply when guide id does not match pending', () => {
    expect(shouldApplyTravelGuideSearchPrefill(activityLegacyId, 'other-guide')).toBe(
      false,
    );
  });
});
