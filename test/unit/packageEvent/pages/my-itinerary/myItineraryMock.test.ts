import { describe, expect, it } from 'vitest';
import {
  buildItineraryBannerCopy,
  extractPerformanceArtistsFromDays,
  MY_ITINERARY_DAYS,
  parseSelectedDjIds,
} from '@/packageEvent/pages/my-itinerary/myItineraryMock';

describe('parseSelectedDjIds', () => {
  it('returns empty array for blank input', () => {
    expect(parseSelectedDjIds()).toEqual([]);
    expect(parseSelectedDjIds('')).toEqual([]);
    expect(parseSelectedDjIds('  ')).toEqual([]);
  });

  it('splits comma-separated ids and trims whitespace', () => {
    expect(parseSelectedDjIds('marshmello, illenium')).toEqual([
      'marshmello',
      'illenium',
    ]);
  });

  it('filters empty segments', () => {
    expect(parseSelectedDjIds('marshmello,,illenium,')).toEqual([
      'marshmello',
      'illenium',
    ]);
  });
});

describe('MY_ITINERARY_DAYS', () => {
  it('includes mock timeline for both festival days', () => {
    expect(MY_ITINERARY_DAYS).toHaveLength(2);
    expect(MY_ITINERARY_DAYS[0]?.items.length).toBeGreaterThan(0);
    expect(MY_ITINERARY_DAYS[1]?.items.length).toBeGreaterThan(0);
  });
});

describe('buildItineraryBannerCopy', () => {
  it('uses selected dj count and names from catalog', () => {
    const copy = buildItineraryBannerCopy({
      selectedDjIds: ['excision', 'marshmello'],
      selectedDjNames: ['EXCISION', 'MARSHMELLO'],
      itineraryArtistNames: [],
      eventMeta: '风暴电音节 深圳站',
      dayLabels: ['6月13日', '6月14日'],
    });
    expect(copy.title).toBe('已根据你选择的 2 位 DJ 生成电音时间表');
    expect(copy.subtitle).toContain('EXCISION · MARSHMELLO');
    expect(copy.subtitle).toContain('覆盖 6月13日、6月14日');
    expect(copy.subtitle).not.toContain('时间节点');
  });

  it('falls back to artists parsed from itinerary days', () => {
    const artists = extractPerformanceArtistsFromDays(MY_ITINERARY_DAYS);
    expect(artists).toEqual(['EXCISION', 'MARSHMELLO', 'ERIC PRYDZ', 'ILLENIUM']);

    const copy = buildItineraryBannerCopy({
      selectedDjIds: [],
      selectedDjNames: [],
      itineraryArtistNames: artists,
      eventMeta: '风暴电音节 深圳站',
      dayLabels: ['6月13日', '6月14日'],
    });
    expect(copy.title).toBe('已根据你选择的 4 位 DJ 生成电音时间表');
    expect(copy.subtitle).toContain('EXCISION');
  });
});
