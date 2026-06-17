import { describe, expect, it } from 'vitest';
import {
  buildItineraryBannerCopy,
  extractPerformanceArtistsFromDays,
  parseSelectedDjIds,
  resolveDjDisplayNames,
} from '@/domains/performance-itinerary/utils/itineraryBanner';
import { FIXTURE_ITINERARY_DAYS } from '../../../../fixtures/itineraryUi.fixture';

describe('itineraryBanner utils', () => {
  it('parses selected DJ ids from query string', () => {
    expect(parseSelectedDjIds('marshmello, illenium')).toEqual([
      'marshmello',
      'illenium',
    ]);
    expect(parseSelectedDjIds('marshmello,,illenium,')).toEqual([
      'marshmello',
      'illenium',
    ]);
  });

  it('parses pipe-delimited selected DJ lists for route params', () => {
    expect(parseSelectedDjIds('carta|dennett|fifi|odd-mob')).toEqual([
      'carta',
      'dennett',
      'fifi',
      'odd-mob',
    ]);
  });

  it('extracts performance artists from generated days', () => {
    const artists = extractPerformanceArtistsFromDays(FIXTURE_ITINERARY_DAYS);
    expect(artists).toEqual(['EXCISION', 'MARSHMELLO', 'ERIC PRYDZ', 'ILLENIUM']);
  });

  it('builds banner copy from selected DJs', () => {
    const copy = buildItineraryBannerCopy({
      selectedDjIds: ['excision', 'marshmello'],
      selectedDjNames: ['EXCISION', 'MARSHMELLO'],
      itineraryArtistNames: [],
      eventMeta: '风暴电音节 深圳站',
      dayLabels: ['6月13日', '6月14日'],
    });

    expect(copy.title).toContain('2 位 DJ');
    expect(copy.subtitle).toContain('EXCISION · MARSHMELLO');
    expect(copy.subtitle).toContain('6月13日');
  });

  it('resolves display names from catalog', () => {
    expect(
      resolveDjDisplayNames(['marshmello'], [{ id: 'marshmello', name: 'MARSHMELLO' }]),
    ).toEqual(['MARSHMELLO']);
  });
});
