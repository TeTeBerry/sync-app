import { beforeAll, describe, expect, it } from 'vitest';
import { loadMessages } from '@/i18n/messages';
import { useLocaleStore } from '@/i18n/localeStore';
import {
  formatActivityAreaLabel,
  formatActivityLocationLabel,
  formatActivityRegionLabel,
} from '@/utils/formatActivityDisplay';

describe('formatActivityDisplay', () => {
  beforeAll(async () => {
    await loadMessages('zh-CN');
    await loadMessages('en-US');
  });

  it('formatActivityAreaLabel prefers area over map region in zh-CN', () => {
    useLocaleStore.setState({ locale: 'zh-CN' });
    expect(formatActivityAreaLabel({ area: '日本', region: 'overseas' })).toBe('日本');
    expect(formatActivityAreaLabel({ region: 'overseas' })).toBe('海外');
  });

  it('formatActivityAreaLabel translates catalog areas in en-US', () => {
    useLocaleStore.setState({ locale: 'en-US' });
    expect(formatActivityAreaLabel({ area: '日本', region: 'overseas' })).toBe('Japan');
    expect(formatActivityAreaLabel({ region: 'overseas' })).toBe('Overseas');
    expect(formatActivityAreaLabel({ area: '中国', region: 'domestic' })).toBe('China');
  });

  it('formatActivityRegionLabel translates map regions', () => {
    useLocaleStore.setState({ locale: 'en-US' });
    expect(formatActivityRegionLabel('hmt')).toBe('HK / Macao / Taiwan');
    useLocaleStore.setState({ locale: 'zh-CN' });
    expect(formatActivityRegionLabel('hmt')).toBe('港澳台');
  });

  it('formatActivityLocationLabel translates known catalog venues', () => {
    useLocaleStore.setState({ locale: 'en-US' });
    expect(formatActivityLocationLabel('深圳国际会展中心')).toBe(
      'Shenzhen World Exhibition & Convention Center',
    );
    useLocaleStore.setState({ locale: 'zh-CN' });
    expect(formatActivityLocationLabel('深圳国际会展中心')).toBe('深圳国际会展中心');
    expect(formatActivityLocationLabel('上海·外滩大会新址科技展馆')).toBe(
      '上海·外滩大会新址科技展馆',
    );
  });
});
