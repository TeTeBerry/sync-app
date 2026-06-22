import { describe, expect, it } from 'vitest';
import type { EventCardUi } from '@/utils/apiMappers';
import {
  filterActivitiesByRegion,
  filterActivitiesByTimeChip,
  selectHotCatalogEvents,
} from '@/utils/filterActivitiesForEventsCatalog';

function event(
  partial: Partial<EventCardUi> & Pick<EventCardUi, 'title'>,
): EventCardUi {
  return {
    id: partial.id ?? '1',
    title: partial.title,
    date: partial.date ?? '06/13-14',
    location: partial.location ?? 'Bangkok',
    distance: '',
    image: '',
    attendees: 0,
    category: '电音节',
    hot: partial.hot ?? false,
    going: false,
    region: partial.region,
    alias: partial.alias,
  };
}

describe('filterActivitiesForEventsCatalog', () => {
  const events = [
    event({ id: '1', title: 'EDC Thailand', region: 'overseas', hot: true }),
    event({ id: '4', title: 'Storm', region: 'domestic', hot: true, date: '06/13-14' }),
    event({
      id: '8',
      title: 'EDC Korea',
      region: 'overseas',
      hot: false,
      date: '10/03-04',
    }),
  ];

  it('filterActivitiesByRegion returns all for "all"', () => {
    expect(filterActivitiesByRegion(events, 'all')).toHaveLength(3);
  });

  it('filterActivitiesByRegion filters by region', () => {
    expect(filterActivitiesByRegion(events, 'domestic')).toEqual([events[1]]);
    expect(filterActivitiesByRegion(events, 'overseas')).toHaveLength(2);
  });

  it('filterActivitiesByTimeChip filters hot events', () => {
    expect(filterActivitiesByTimeChip(events, 'hot')).toHaveLength(2);
  });

  it('selectHotCatalogEvents returns hot non-ended events up to limit', () => {
    const now = new Date('2026-06-01T12:00:00.000Z');
    const hot = selectHotCatalogEvents(events, 5, now);
    expect(hot).toHaveLength(2);
    expect(hot.every((item) => item.hot)).toBe(true);
  });
});
