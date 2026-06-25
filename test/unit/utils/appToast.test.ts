import { beforeEach, describe, expect, it, vi } from 'vitest';

vi.mock('@tarojs/taro', () => ({
  default: {
    showToast: vi.fn(),
  },
}));

vi.mock('@/i18n', () => ({
  t: vi.fn((key: string) => `translated:${key}`),
}));

import Taro from '@tarojs/taro';
import { t } from '@/i18n';
import { showAppToast } from '@/utils/appToast';

describe('showAppToast', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('translates message keys by default', () => {
    showAppToast('common.deleted', { icon: 'success' });
    expect(t).toHaveBeenCalledWith('common.deleted', undefined);
    expect(Taro.showToast).toHaveBeenCalledWith({
      title: 'translated:common.deleted',
      icon: 'success',
      duration: 2000,
    });
  });

  it('shows raw messages when requested', () => {
    showAppToast('招募帖已发布', { raw: true, icon: 'success', duration: 3000 });
    expect(t).not.toHaveBeenCalled();
    expect(Taro.showToast).toHaveBeenCalledWith({
      title: '招募帖已发布',
      icon: 'success',
      duration: 3000,
    });
  });

  it('passes interpolation params to t()', () => {
    showAppToast('common.people', { params: { count: 3 }, icon: 'none' });
    expect(t).toHaveBeenCalledWith('common.people', { count: 3 });
    expect(Taro.showToast).toHaveBeenCalledWith({
      title: 'translated:common.people',
      icon: 'none',
      duration: 2000,
    });
  });

  it('supports raw string with icon shorthand', () => {
    showAppToast('Network error', 'none');
    expect(Taro.showToast).toHaveBeenCalledWith({
      title: 'Network error',
      icon: 'none',
      duration: 2000,
    });
  });
});
