import { describe, expect, it } from 'vitest';
import type { HomeSummary, ProfileActivityItem } from '@/types/backend';
import {
  pickNextRegisteredEvent,
  pickNextRegisteredEventForUser,
} from '@/pages/index/utils/pickNextRegisteredEvent';

type HomeActivityEvent = HomeSummary['signupEvents'][number];

function event(
  id: number,
  date: string,
  going = true,
  title = `Event ${id}`,
): HomeActivityEvent {
  return {
    id,
    title,
    date,
    location: '',
    image: '',
    category: '电音节',
    hot: false,
    attendees: 0,
    going,
  };
}

describe('pickNextRegisteredEvent', () => {
  const now = new Date(2026, 5, 1);

  it('returns null when user has no registrations', () => {
    const events = [event(1, '06/13-14', false), event(2, '10/03-04', false)];
    expect(pickNextRegisteredEvent(events, now)).toBeNull();
  });

  it('returns nearest upcoming registered event', () => {
    const events = [
      event(1, '06/13-14', true),
      event(2, '10/03-04', true),
      event(3, '12/18-20', false),
    ];

    expect(pickNextRegisteredEvent(events, now)?.id).toBe(1);
  });

  it('skips ended registered events', () => {
    const events = [event(1, '01/01-02', true), event(2, '10/03-04', true)];

    expect(pickNextRegisteredEvent(events, now)?.id).toBe(2);
  });

  it('returns null when registered ids from store are empty despite stale home going', () => {
    const events = [event(8, '10/03-04', true)];

    expect(
      pickNextRegisteredEventForUser(events, { registeredLegacyIds: [] }),
    ).toBeNull();
  });

  it('uses registered ids from store instead of stale home going flags', () => {
    const events = [event(8, '06/13-14', true), event(9, '10/03-04', false)];

    expect(
      pickNextRegisteredEventForUser(events, { registeredLegacyIds: [9] }, now)?.id,
    ).toBe(9);
  });

  it('returns null when profile activities are loaded empty despite stale home going', () => {
    const events = [event(8, '10/03-04', true)];
    const profileActivities: ProfileActivityItem[] = [];

    expect(
      pickNextRegisteredEventForUser(events, { profileActivities }, now),
    ).toBeNull();
  });

  it('uses profile activities instead of stale home going flags', () => {
    const events = [event(8, '06/13-14', true), event(9, '10/03-04', false)];
    const profileActivities: ProfileActivityItem[] = [
      {
        id: '9',
        activityLegacyId: '9',
        title: 'EDC',
        date: '10/03-04',
        location: '',
        image: '',
        status: 'registered',
      },
    ];

    expect(pickNextRegisteredEventForUser(events, { profileActivities }, now)?.id).toBe(
      9,
    );
  });
});
