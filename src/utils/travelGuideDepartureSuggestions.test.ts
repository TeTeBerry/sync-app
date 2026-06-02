import { describe, expect, it } from 'vitest';
import {
  departurePickCoercedFromPlace,
  departureValueForSubmit,
  eventCityFromLocation,
  mapPlaceSuggestionsToDepartureItems,
} from './travelGuideDepartureSuggestions';

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

  it('coerces POI suggestion to city for submit', () => {
    const item = {
      label: '拼多多公司',
      kind: 'place' as const,
      city: '上海市',
      address: '上海市长宁区',
    };
    expect(departureValueForSubmit(item)).toBe('上海');
    expect(departurePickCoercedFromPlace(item)).toBe(true);
  });
});
