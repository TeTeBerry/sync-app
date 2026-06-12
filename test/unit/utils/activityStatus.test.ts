import { describe, expect, it } from 'vitest';
import {
  compareActivitiesNearestFirst,
  findNearestUpcomingActivity,
} from '@/utils/activityStatus';

const NOW = new Date(2026, 4, 30, 12, 0, 0, 0);

function sortNearest(
  items: Array<{ date?: string; title?: string }>,
): Array<{ date?: string; title?: string }> {
  return [...items].sort((a, b) => compareActivitiesNearestFirst(a, b, NOW));
}

describe('compareActivitiesNearestFirst', () => {
  it('orders non-ended events by start date ascending', () => {
    const sorted = sortNearest([
      { date: '07/12', title: 'Later' },
      { date: '06/01', title: 'Sooner' },
    ]);
    expect(sorted.map((e) => e.date)).toEqual(['06/01', '07/12']);
  });

  it('places ended events after upcoming ones', () => {
    const sorted = sortNearest([
      { date: '2024-07-12', title: 'Past fest' },
      { date: '07/12', title: 'Upcoming fest' },
    ]);
    expect(sorted.map((e) => e.date)).toEqual(['07/12', '2024-07-12']);
  });

  it('orders ended events by start date descending', () => {
    const sorted = sortNearest([
      { date: '2023-12-11', title: 'Older ended' },
      { date: '2024-07-12', title: 'Newer ended' },
    ]);
    expect(sorted.map((e) => e.date)).toEqual(['2024-07-12', '2023-12-11']);
  });

  it('pushes items without parseable dates to the end', () => {
    const sorted = sortNearest([
      { date: '', title: 'No date' },
      { date: '06/01', title: 'Dated' },
    ]);
    expect(sorted.map((e) => e.title)).toEqual(['Dated', 'No date']);
  });
});

describe('findNearestUpcomingActivity', () => {
  const NOW = new Date(2026, 4, 30, 12, 0, 0, 0);

  it('returns the soonest future activity that has not ended', () => {
    const nearest = findNearestUpcomingActivity(
      [
        { title: 'Later fest', date: '07/12' },
        { title: 'Sooner fest', date: '06/01' },
      ],
      NOW,
    );
    expect(nearest?.title).toBe('Sooner fest');
    expect(nearest?.startAt.getTime()).toBeGreaterThan(NOW.getTime());
  });

  it('uses 14:00 show start for Storm countdown', () => {
    const nearest = findNearestUpcomingActivity(
      [{ title: '风暴电音节 深圳站', date: '06/13-14' }],
      NOW,
    );
    expect(nearest?.title).toBe('风暴电音节 深圳站');
    expect(nearest?.startAt).toEqual(new Date(2026, 5, 13, 14, 0, 0, 0));
  });

  it('keeps Storm countdown on show day before 14:00', () => {
    const morningOfShowDay = new Date(2026, 5, 13, 10, 0, 0, 0);
    const nearest = findNearestUpcomingActivity(
      [{ title: '风暴电音节 深圳站', date: '06/13-14' }],
      morningOfShowDay,
    );
    expect(nearest?.title).toBe('风暴电音节 深圳站');
    expect(nearest?.startAt).toEqual(new Date(2026, 5, 13, 14, 0, 0, 0));
  });

  it('ignores ended and already-started activities', () => {
    const nearest = findNearestUpcomingActivity(
      [
        { title: 'Past fest', date: '2024-07-12' },
        { title: 'Today fest', date: '05/30' },
        { title: 'Future fest', date: '07/12' },
      ],
      NOW,
    );
    expect(nearest?.title).toBe('Future fest');
  });

  it('returns null when no upcoming activities remain', () => {
    expect(
      findNearestUpcomingActivity([{ title: 'Past fest', date: '2024-07-12' }], NOW),
    ).toBeNull();
  });
});
