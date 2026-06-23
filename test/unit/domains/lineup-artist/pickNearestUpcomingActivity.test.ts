import { describe, expect, it } from 'vitest';
import type { BackendActivity } from '../../../../src/types/backend';
import { pickNearestUpcomingActivity } from '../../../../src/domains/lineup-artist/utils/pickNearestUpcomingActivity';

function activity(legacyId: number, name: string, date?: string): BackendActivity {
  return {
    _id: String(legacyId),
    legacyId,
    name,
    code: `c${legacyId}`,
    date,
  };
}

describe('pickNearestUpcomingActivity', () => {
  const now = new Date('2030-06-01T12:00:00');

  it('returns nearest upcoming activity', () => {
    const result = pickNearestUpcomingActivity(
      [
        activity(2, 'Later Fest 2030', '12/01-02'),
        activity(1, 'Soon Fest 2030', '06/10-11'),
      ],
      now,
    );

    expect(result?.legacyId).toBe(1);
  });

  it('returns null when all activities ended', () => {
    const result = pickNearestUpcomingActivity(
      [activity(1, 'Past Fest 2020', '01/01-02')],
      now,
    );

    expect(result).toBeNull();
  });
});
