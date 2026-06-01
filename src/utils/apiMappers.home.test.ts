import { describe, expect, it } from 'vitest';
import { pickHomeFeaturedEvents } from './apiMappers';
import type { HomeSummary } from '../types/backend';

type SignupEvent = HomeSummary['signupEvents'][number];

function signupEvent(
  partial: Partial<SignupEvent> & Pick<SignupEvent, 'id' | 'title'>,
): SignupEvent {
  return {
    date: '06/01',
    location: 'SZ',
    image: '',
    category: 'edm',
    hot: false,
    attendees: 0,
    going: false,
    ...partial,
  };
}

describe('pickHomeFeaturedEvents', () => {
  it('returns at most two events with hot items first', () => {
    const events = [
      signupEvent({ id: 1, title: 'Regular A', hot: false }),
      signupEvent({ id: 2, title: 'Hot B', hot: true }),
      signupEvent({ id: 3, title: 'Regular C', hot: false }),
      signupEvent({ id: 4, title: 'Hot D', hot: true }),
    ];

    const picked = pickHomeFeaturedEvents(events);
    expect(picked).toHaveLength(2);
    expect(picked.map((item) => item.title)).toEqual(['Hot B', 'Hot D']);
    expect(picked.every((item) => item.isHot)).toBe(true);
  });

  it('fills remaining slots with non-hot events when fewer than two hot', () => {
    const events = [
      signupEvent({ id: 1, title: 'Regular A', hot: false }),
      signupEvent({ id: 2, title: 'Hot B', hot: true }),
      signupEvent({ id: 3, title: 'Regular C', hot: false }),
    ];

    const picked = pickHomeFeaturedEvents(events);
    expect(picked.map((item) => item.title)).toEqual(['Hot B', 'Regular A']);
  });

  it('maps signup fields into featured event shape', () => {
    const picked = pickHomeFeaturedEvents([
      signupEvent({
        id: 9,
        title: 'Storm Fest',
        location: 'Shanghai',
        hot: true,
        attendees: 120,
        going: true,
      }),
    ]);

    expect(picked[0]).toMatchObject({
      legacyId: 9,
      title: 'Storm Fest',
      venue: 'Shanghai',
      isHot: true,
      going: true,
      attendeeCount: '120+',
    });
  });
});
