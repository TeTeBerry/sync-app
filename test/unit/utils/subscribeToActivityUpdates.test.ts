import { beforeEach, describe, expect, it, vi } from 'vitest';
import { subscribeToActivityUpdates } from '@/utils/subscribeToActivityUpdates';
import {
  registerForActivityAndInvalidate,
  optInWechatActivityUpdatesAndInvalidate,
} from '@/hooks/sync/activities';
import { markActivityUpdateSubscribedLocally } from '@/utils/activityUpdateSubscribeStorage';
import { requestActivityUpdateSubscribe } from '@/utils/wechatSubscribeMessage';

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
  registerForActivityAndInvalidate: vi.fn(),
  optInWechatActivityUpdatesAndInvalidate: vi.fn(),
}));

vi.mock('@/utils/authStorage', () => ({
  isLoggedIn: vi.fn(() => true),
}));

vi.mock('@/utils/activityUpdateSubscribeStorage', () => ({
  isActivityUpdateSubscribedLocally: vi.fn(),
  markActivityUpdateSubscribedLocally: vi.fn(),
}));

vi.mock('@/utils/wechatSubscribeMessage', () => ({
  isActivityUpdateSubscribeConfigured: vi.fn(() => true),
  requestActivityUpdateSubscribe: vi.fn(),
}));

describe('subscribeToActivityUpdates', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    vi.mocked(registerForActivityAndInvalidate).mockResolvedValue({
      ok: true,
      activityLegacyId: 8,
      status: 'registered',
      attendees: 1,
    });
    vi.mocked(optInWechatActivityUpdatesAndInvalidate).mockResolvedValue({
      ok: true,
      activityLegacyId: 8,
      wechatActivityUpdateOptIn: true,
    });
  });

  it('registers activity and marks local state when WeChat accepts', async () => {
    vi.mocked(requestActivityUpdateSubscribe).mockResolvedValue('accepted');

    await expect(subscribeToActivityUpdates(8)).resolves.toBe('wechat_accepted');
    expect(registerForActivityAndInvalidate).toHaveBeenCalledWith(8);
    expect(optInWechatActivityUpdatesAndInvalidate).toHaveBeenCalledWith(8);
    expect(markActivityUpdateSubscribedLocally).toHaveBeenCalledWith(8);
    expect(Taro.showToast).toHaveBeenCalledWith(
      expect.objectContaining({ icon: 'success' }),
    );
  });

  it('falls back to in-app follow when WeChat is rejected', async () => {
    vi.mocked(requestActivityUpdateSubscribe).mockResolvedValue('rejected');

    await expect(subscribeToActivityUpdates(8)).resolves.toBe('in_app_only');
    expect(markActivityUpdateSubscribedLocally).toHaveBeenCalledWith(8);
    expect(Taro.showToast).toHaveBeenCalledWith(
      expect.objectContaining({ icon: 'none' }),
    );
  });

  it('returns register_failed when registration fails', async () => {
    vi.mocked(registerForActivityAndInvalidate).mockRejectedValue(new Error('fail'));

    await expect(subscribeToActivityUpdates(8)).resolves.toBe('register_failed');
    expect(markActivityUpdateSubscribedLocally).not.toHaveBeenCalled();
  });
});
