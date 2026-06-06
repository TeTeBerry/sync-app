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
    category: '电音节',
    hot: false,
    attendees: 0,
    going: false,
    ...partial,
  };
}

describe('pickHomeFeaturedEvents', () => {
  it('orders hot items before non-hot', () => {
    const events = [
      signupEvent({ id: 1, title: 'Regular A', hot: false }),
      signupEvent({ id: 2, title: 'Hot B', hot: true }),
      signupEvent({ id: 3, title: 'Regular C', hot: false }),
      signupEvent({ id: 5, title: 'Hot E', hot: true }),
    ];

    const picked = pickHomeFeaturedEvents(events);
    expect(picked.map((item) => item.title)).toEqual([
      'Hot B',
      'Hot E',
      'Regular A',
      'Regular C',
    ]);
  });

  it('pins storm fest (legacyId 4) to the first card', () => {
    const events = [
      signupEvent({ id: 1, title: 'Regular A', hot: false }),
      signupEvent({ id: 2, title: 'Hot B', hot: true }),
      signupEvent({ id: 4, title: '风暴电音节 深圳站', hot: true }),
      signupEvent({ id: 3, title: 'Regular C', hot: false }),
    ];

    const picked = pickHomeFeaturedEvents(events);
    expect(picked[0]?.title).toBe('风暴电音节 深圳站');
    expect(picked.map((item) => item.title)).toEqual([
      '风暴电音节 深圳站',
      'Hot B',
      'Regular A',
      'Regular C',
    ]);
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
