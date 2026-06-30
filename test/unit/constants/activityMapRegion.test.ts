import { describe, expect, it } from 'vitest';
import {
  resolveActivityMapRegion,
  shouldShowTravelGuideDomesticOptions,
} from '@/constants/activityMapRegion';

describe('shouldShowTravelGuideDomesticOptions', () => {
  it('shows domestic guide options only for domestic activities', () => {
    expect(shouldShowTravelGuideDomesticOptions('domestic')).toBe(true);
    expect(shouldShowTravelGuideDomesticOptions('overseas')).toBe(false);
    expect(shouldShowTravelGuideDomesticOptions('hmt')).toBe(false);
    expect(shouldShowTravelGuideDomesticOptions(undefined)).toBe(false);
    expect(shouldShowTravelGuideDomesticOptions(null)).toBe(false);
  });
});

describe('resolveActivityMapRegion', () => {
  it('resolves TML Shanghai as domestic when region is missing', () => {
    expect(
      resolveActivityMapRegion({
        legacyId: 16,
        code: 'tomorrowland-shanghai',
        location: '上海·外滩大会新址科技展馆',
        name: 'The Magic Of Tomorrowland 上海 2026',
      }),
    ).toBe('domestic');
    expect(
      shouldShowTravelGuideDomesticOptions({
        legacyId: 16,
        code: 'tomorrowland-shanghai',
        location: '上海·外滩大会新址科技展馆',
      }),
    ).toBe(true);
  });

  it('keeps overseas activities overseas when region is set', () => {
    expect(
      resolveActivityMapRegion({
        region: 'overseas',
        code: 'world-dj-festival',
        location: '日本·东京',
      }),
    ).toBe('overseas');
  });
});
