import { describe, expect, it } from 'vitest';
import {
  buildRegisteredActivityLegacyIds,
  isActivityRegistered,
  mergeCountdownActivityCandidates,
  pickCountdownActivityCandidates,
} from '../../../src/utils/activityRegistration';
import { findNearestUpcomingActivity } from '../../../src/utils/activityStatus';

describe('buildRegisteredActivityLegacyIds', () => {
  it('merges home going flags with profile activities', () => {
    const ids = buildRegisteredActivityLegacyIds(
      [{ id: '1', going: false } as never, { id: '2', going: true } as never],
      [{ id: '3' } as never, { id: '4' } as never],
    );

    expect([...ids].sort((a, b) => a - b)).toEqual([2, 3, 4]);
  });

  it('dedupes when home and profile share the same legacy id', () => {
    const ids = buildRegisteredActivityLegacyIds(
      [{ id: '42', going: true } as never],
      [{ id: '42' } as never],
    );

    expect([...ids]).toEqual([42]);
  });
});

describe('isActivityRegistered', () => {
  it('returns true when legacy id is in the set', () => {
    expect(isActivityRegistered(7, new Set([7]))).toBe(true);
  });

  it('returns false for null or missing ids', () => {
    expect(isActivityRegistered(null, new Set([7]))).toBe(false);
    expect(isActivityRegistered(8, new Set([7]))).toBe(false);
  });
});

describe('pickCountdownActivityCandidates', () => {
  const catalog = [
    { title: '风暴', date: '06/13-14', legacyId: 4 },
    { title: 'EDC Korea', date: '10/03-04', legacyId: 8 },
    { title: 'EDC Thailand', date: '12/18-20', legacyId: 5 },
  ];

  it('uses full catalog when user has no registrations', () => {
    const picked = pickCountdownActivityCandidates(catalog, new Set());
    expect(picked).toHaveLength(3);
  });

  it('limits to registered activities when user has signups', () => {
    const picked = pickCountdownActivityCandidates(catalog, new Set([8, 5]));
    expect(picked.map((item) => item.legacyId).sort()).toEqual([5, 8]);
  });
});

describe('home countdown selection', () => {
  const NOW = new Date(2026, 4, 30, 12, 0, 0, 0);

  it('shows nearest catalog activity when user has no registrations', () => {
    const merged = mergeCountdownActivityCandidates(
      [{ id: 4, title: '风暴', date: '06/13-14' } as never],
      [{ legacyId: 8, name: 'EDC Korea', date: '10/03-04' } as never],
    );
    const nearest = findNearestUpcomingActivity(
      pickCountdownActivityCandidates(merged, new Set()),
      NOW,
    );
    expect(nearest?.title).toBe('风暴');
  });

  it('shows nearest registered activity when user has signups', () => {
    const merged = mergeCountdownActivityCandidates(
      [
        { id: 4, title: '风暴', date: '06/13-14', going: true } as never,
        { id: 8, title: 'EDC Korea', date: '10/03-04', going: false } as never,
      ],
      undefined,
    );
    const registered = buildRegisteredActivityLegacyIds(
      [{ id: 8, going: true } as never],
      undefined,
    );
    const nearest = findNearestUpcomingActivity(
      pickCountdownActivityCandidates(merged, registered),
      NOW,
    );
    expect(nearest?.title).toBe('EDC Korea');
  });
});
