import { describe, expect, it } from 'vitest';
import { labelMatchesKey, translate } from '@/i18n/translate';
import { useLocaleStore } from '@/i18n/localeStore';

describe('i18n translate', () => {
  it('resolves zh-CN messages', () => {
    expect(translate('tab.home', 'zh-CN')).toBe('首页');
    expect(translate('tab.home', 'en-US')).toBe('Home');
  });

  it('interpolates template params', () => {
    expect(translate('home.heatActive', 'zh-CN', { count: 42 })).toBe(
      '近 42 人已选择近期活动',
    );
  });

  it('falls back to default locale for missing keys', () => {
    expect(translate('nonexistent.key', 'en-US')).toBe('nonexistent.key');
  });

  it('labelMatchesKey matches both locales', () => {
    expect(labelMatchesKey('生成出行攻略', 'ai.generateTravelGuide')).toBe(true);
    expect(labelMatchesKey('Generate travel guide', 'ai.generateTravelGuide')).toBe(
      true,
    );
    expect(labelMatchesKey('其他', 'ai.generateTravelGuide')).toBe(false);
  });

  it('t() uses store locale', () => {
    useLocaleStore.setState({ locale: 'en-US' });
    expect(translate('tab.profile', useLocaleStore.getState().locale)).toBe('Me');
    useLocaleStore.setState({ locale: 'zh-CN' });
  });
});
