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
  clearProfilePersonalityNudgeDismiss,
  dismissProfilePersonalityNudge,
  isProfilePersonalityNudgeDismissed,
} from '@/components/profile/utils/profilePersonalityNudgeStorage';

describe('profilePersonalityNudgeStorage', () => {
  beforeEach(() => {
    storage.clear();
    vi.useRealTimers();
  });

  it('returns false when user has not dismissed', () => {
    expect(isProfilePersonalityNudgeDismissed('wx_user_a')).toBe(false);
  });

  it('returns true within 7 days after dismiss', () => {
    vi.useFakeTimers();
    vi.setSystemTime(new Date('2026-06-01T12:00:00Z'));

    dismissProfilePersonalityNudge('wx_user_a');
    expect(isProfilePersonalityNudgeDismissed('wx_user_a')).toBe(true);

    vi.setSystemTime(new Date('2026-06-07T11:59:59Z'));
    expect(isProfilePersonalityNudgeDismissed('wx_user_a')).toBe(true);
  });

  it('expires dismiss after 7 days', () => {
    vi.useFakeTimers();
    vi.setSystemTime(new Date('2026-06-01T12:00:00Z'));

    dismissProfilePersonalityNudge('wx_user_a');

    vi.setSystemTime(new Date('2026-06-08T12:00:01Z'));
    expect(isProfilePersonalityNudgeDismissed('wx_user_a')).toBe(false);
  });

  it('scopes dismiss state per user', () => {
    dismissProfilePersonalityNudge('wx_user_a');
    expect(isProfilePersonalityNudgeDismissed('wx_user_b')).toBe(false);
  });

  it('clears dismiss state for the matching user', () => {
    dismissProfilePersonalityNudge('wx_user_a');
    clearProfilePersonalityNudgeDismiss('wx_user_a');
    expect(isProfilePersonalityNudgeDismissed('wx_user_a')).toBe(false);
  });
});
