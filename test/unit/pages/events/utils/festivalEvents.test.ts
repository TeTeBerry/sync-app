import { describe, expect, it, vi, afterEach } from 'vitest';
import type { EventCardUi } from '@/utils/apiMappers';
import {
  isFestivalEvent,
  sortAllEventsByDate,
  sortFestivalEventsByDate,
} from '@/pages/events/utils/festivalEvents';

function event(
  partial: Partial<EventCardUi> & Pick<EventCardUi, 'id' | 'title' | 'date'>,
): EventCardUi {
  return {
    location: '',
    distance: '',
    image: '',
    attendees: 0,
    category: '电音节',
    hot: false,
    going: false,
    ...partial,
  };
}

describe('festivalEvents', () => {
  it('filters and sorts festivals by start date ascending', () => {
    const sorted = sortFestivalEventsByDate([
      event({ id: '3', title: 'Storm 2026', date: '06/13-14' }),
      event({ id: '1', title: 'VAC 2026', date: '04/18-19' }),
      event({ id: '2', title: 'Indoor', date: '05/01', category: '室内电音' }),
    ]);

    expect(sorted.map((item) => item.id)).toEqual(['1', '3']);
    expect(isFestivalEvent({ category: '室内电音' })).toBe(false);
  });

  it('sorts all activities with upcoming first and ended after', () => {
    vi.useFakeTimers();
    vi.setSystemTime(new Date('2026-07-01T12:00:00'));

    const sorted = sortAllEventsByDate([
      event({ id: '3', title: 'Storm 2026', date: '06/13-14' }),
      event({ id: '2', title: 'Indoor 2026', date: '05/01', category: '室内电音' }),
      event({ id: '1', title: 'VAC 2026', date: '04/18-19' }),
    ]);
    expect(sorted.map((item) => item.id)).toEqual(['3', '2', '1']);

    vi.useRealTimers();
  });

  afterEach(() => {
    vi.useRealTimers();
  });
});
