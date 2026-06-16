import { beforeEach, describe, expect, it, vi } from 'vitest';
import Taro from '@tarojs/taro';
import { registerForActivityAndInvalidate } from '@/hooks/sync/activities';
import { registerForActivityWithFeedback } from '@/utils/joinActivity';

vi.mock('@/hooks/sync/activities', () => ({
  registerForActivityAndInvalidate: vi.fn(),
}));

vi.mock('@/constants/api', () => ({
  API_BASE_URL: 'https://api.test',
  isApiEnabled: vi.fn(() => true),
}));

vi.mock('@tarojs/taro', () => ({
  default: {
    showToast: vi.fn(),
  },
}));

describe('registerForActivityWithFeedback', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('shows success toast after registration', async () => {
    vi.mocked(registerForActivityAndInvalidate).mockResolvedValue({
      ok: true,
      activityLegacyId: 4,
      status: 'registered',
      attendees: 6,
    });

    const ok = await registerForActivityWithFeedback(4);

    expect(ok).toBe(true);
    expect(registerForActivityAndInvalidate).toHaveBeenCalledWith(4);
    expect(Taro.showToast).toHaveBeenCalledWith(
      expect.objectContaining({ title: '已报名本场活动', icon: 'success' }),
    );
  });

  it('does not toast when already registered on server', async () => {
    vi.mocked(registerForActivityAndInvalidate).mockResolvedValue({
      ok: true,
      activityLegacyId: 4,
      status: 'registered',
      alreadyRegistered: true,
      attendees: 5,
    });

    const ok = await registerForActivityWithFeedback(4);

    expect(ok).toBe(true);
    expect(Taro.showToast).not.toHaveBeenCalled();
  });
});
