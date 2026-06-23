import { beforeEach, describe, expect, it, vi } from 'vitest';

vi.mock('@tarojs/taro', () => ({
  default: {
    getStorageSync: vi.fn(() => ''),
    setStorageSync: vi.fn(),
  },
}));

import { useLocaleStore } from '@/i18n/localeStore';
import { translate, clearTranslationCache } from '@/i18n/translate';

describe('localeStore setLocale', () => {
  beforeEach(() => {
    clearTranslationCache();
    useLocaleStore.setState({
      locale: 'zh-CN',
      hydrated: true,
      status: 'loaded',
      error: null,
      messagesReady: true,
      isChangingLocale: false,
    });
  });

  it('switches to en-US in one call with English UI strings', async () => {
    await useLocaleStore.getState().setLocale('en-US');

    expect(useLocaleStore.getState().locale).toBe('en-US');
    expect(translate('tab.home', 'en-US')).toBe('Home');
    expect(translate('settings.language', 'en-US')).toBe('Language');
  });
});
