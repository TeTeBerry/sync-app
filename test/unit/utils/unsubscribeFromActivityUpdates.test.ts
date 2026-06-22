import { beforeEach, describe, expect, it, vi } from 'vitest';
import { unsubscribeFromActivityUpdates } from '@/utils/subscribeToActivityUpdates';
import { unregisterForActivityAndInvalidate } from '@/hooks/sync/activities';
import { clearActivityUpdateSubscribedLocally } from '@/utils/activityUpdateSubscribeStorage';

vi.mock('@tarojs/taro', () => ({
  default: {
    showToast: vi.fn(),
  },
}));

import Taro from '@tarojs/taro';

vi.mock('@/constants/api', () => ({
  isApiEnabled: vi.fn(() => true),
}));

vi.mock('@/hooks/sync/activities', () => ({
  unregisterForActivityAndInvalidate: vi.fn(),
}));

vi.mock('@/utils/authStorage', () => ({
  isLoggedIn: vi.fn(() => true),
}));

vi.mock('@/utils/activityUpdateSubscribeStorage', () => ({
  clearActivityUpdateSubscribedLocally: vi.fn(),
}));

describe('unsubscribeFromActivityUpdates', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    vi.mocked(unregisterForActivityAndInvalidate).mockResolvedValue({
      ok: true,
      activityLegacyId: 8,
      wasRegistered: true,
      attendees: 4,
    });
  });

  it('clears local state and unregisters activity', async () => {
    await expect(unsubscribeFromActivityUpdates(8)).resolves.toBe('success');
    expect(clearActivityUpdateSubscribedLocally).toHaveBeenCalledWith(8);
    expect(unregisterForActivityAndInvalidate).toHaveBeenCalledWith(8);
    expect(Taro.showToast).toHaveBeenCalledWith(
      expect.objectContaining({ icon: 'none' }),
    );
  });

  it('returns unregister_failed when API call fails', async () => {
    vi.mocked(unregisterForActivityAndInvalidate).mockRejectedValue(new Error('fail'));

    await expect(unsubscribeFromActivityUpdates(8)).resolves.toBe('unregister_failed');
    expect(clearActivityUpdateSubscribedLocally).toHaveBeenCalledWith(8);
  });
});
