import { describe, expect, it } from 'vitest';
import type { EventCardUi } from '@/utils/apiMappers';
import { filterActivitiesForEventsSearch } from '@/utils/filterActivitiesForEventsSearch';

function event(
  partial: Partial<EventCardUi> & Pick<EventCardUi, 'title'>,
): EventCardUi {
  return {
    id: '1',
    title: partial.title,
    date: '2026-06-01',
    location: partial.location ?? 'Bangkok',
    distance: '',
    image: '',
    attendees: 0,
    category: partial.category ?? 'Festival',
    hot: false,
    going: false,
  };
}

describe('filterActivitiesForEventsSearch', () => {
  const events = [
    event({ title: 'EDC Thailand', location: 'Pattaya' }),
    event({ title: 'Storm Festival', location: 'Shanghai', category: '电音节' }),
    event({ title: 'Ultra Miami', location: 'Miami' }),
  ];

  it('returns all events when query is empty', () => {
    expect(filterActivitiesForEventsSearch(events, '')).toHaveLength(3);
    expect(filterActivitiesForEventsSearch(events, '   ')).toHaveLength(3);
  });

  it('filters by title substring', () => {
    expect(filterActivitiesForEventsSearch(events, 'edc')).toEqual([events[0]]);
  });

  it('filters by location', () => {
    expect(filterActivitiesForEventsSearch(events, 'shanghai')).toEqual([events[1]]);
  });

  it('expands festival chip aliases', () => {
    expect(filterActivitiesForEventsSearch(events, 'storm')).toEqual([events[1]]);
  });
});
