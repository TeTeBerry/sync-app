import { describe, expect, it } from 'vitest';
import {
  departureCityFromSuggestion,
  departureDisplayValue,
  departureValueForSubmit,
  eventCityFromLocation,
  filterLocalDepartureCitySuggestions,
  mapPlaceSuggestionsToDepartureItems,
  mergeDepartureSuggestionItems,
  normalizeDepartureForSubmit,
  resolveDepartureCityForSubmit,
  suggestionRegionForKeyword,
} from '@/utils/travelGuideDepartureSuggestions';

describe('travelGuideDepartureSuggestions', () => {
  it('parses event city from location', () => {
    expect(eventCityFromLocation('深圳·国际会展中心')).toBe('深圳');
    expect(eventCityFromLocation(undefined)).toBeUndefined();
  });

  it('maps API rows to departure suggestion items', () => {
    const items = mapPlaceSuggestionsToDepartureItems([
      { title: '上海', address: '上海', city: '上海' },
      { title: '上海虹桥站', address: '上海市闵行区', city: '上海市' },
    ]);
    expect(items).toEqual([
      { label: '上海', kind: 'city', city: '上海', address: '上海' },
      {
        label: '上海虹桥站',
        kind: 'place',
        city: '上海市',
        address: '上海市闵行区',
      },
    ]);
  });

  it('uses POI title for display and submit', () => {
    const item = {
      label: '上海尘世货物运输代理有限公司',
      kind: 'place' as const,
      city: '上海市',
      address: '上海市闵行区航南路568号',
    };
    expect(departureDisplayValue(item)).toBe('上海尘世货物运输代理有限公司');
    expect(departureValueForSubmit(item)).toBe('上海尘世货物运输代理有限公司');
  });

  it('normalizes city-only manual input', () => {
    expect(normalizeDepartureForSubmit('上海市')).toBe('上海');
    expect(normalizeDepartureForSubmit('拼多多公司')).toBe('拼多多公司');
  });

  it('reads city from POI suggestion row', () => {
    expect(
      departureCityFromSuggestion({
        label: '拼多多公司',
        kind: 'place',
        city: '上海市',
      }),
    ).toBe('上海');
  });

  it('uses picked city for suggestion region instead of event city', () => {
    expect(
      suggestionRegionForKeyword('拼多多', {
        departureCity: '上海',
        eventCity: '深圳',
      }),
    ).toBe('上海');
    expect(suggestionRegionForKeyword('拼多多', { eventCity: '深圳' })).toBeUndefined();
  });

  it('filters local city suggestions instantly', () => {
    expect(filterLocalDepartureCitySuggestions('')).toHaveLength(8);
    expect(filterLocalDepartureCitySuggestions('上')).toEqual(['上海']);
    expect(filterLocalDepartureCitySuggestions('深')).toEqual(['深圳']);
  });

  it('merges local and remote suggestions without duplicates', () => {
    const merged = mergeDepartureSuggestionItems(
      [{ label: '上海', kind: 'city', city: '上海', address: '上海' }],
      [
        { label: '上海虹桥站', kind: 'place', city: '上海市', address: '闵行区' },
        { label: '上海', kind: 'city', city: '上海', address: '上海' },
      ],
    );
    expect(merged.map((item) => item.label)).toEqual(['上海', '上海虹桥站']);
  });

  it('resolveDepartureCityForSubmit prefers departure anchor over stale city', () => {
    expect(resolveDepartureCityForSubmit('北京', '上海')).toBe('北京');
    expect(resolveDepartureCityForSubmit('上海虹桥', '上海')).toBe('上海');
  });
});
