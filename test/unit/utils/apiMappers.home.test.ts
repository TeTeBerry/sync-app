import { describe, expect, it } from 'vitest';
import { pickHomeFeaturedEvents } from '@/utils/apiMappers';
import type { HomeSummary } from '@/types/backend';

type SignupEvent = HomeSummary['signupEvents'][number];

const NOW = new Date(2026, 4, 30, 12, 0, 0, 0);

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
  it('orders all active events by nearest start when user has no registrations', () => {
    const events = [
      signupEvent({ id: 8, title: 'EDC Korea', date: '10/03-04' }),
      signupEvent({ id: 4, title: '风暴电音节', date: '06/13-14' }),
      signupEvent({ id: 5, title: 'EDC Thailand', date: '12/18-20' }),
    ];

    const picked = pickHomeFeaturedEvents(events, new Set(), NOW);
    expect(picked.map((item) => item.title)).toEqual([
      '风暴电音节',
      'EDC Korea',
      'EDC Thailand',
    ]);
  });

  it('puts registered events first, each group sorted by nearest start', () => {
    const events = [
      signupEvent({ id: 4, title: '风暴电音节', date: '06/13-14' }),
      signupEvent({ id: 8, title: 'EDC Korea', date: '10/03-04' }),
      signupEvent({ id: 5, title: 'EDC Thailand', date: '12/18-20' }),
      signupEvent({ id: 1, title: 'Tomorrowland', date: '12/11-13' }),
    ];

    const picked = pickHomeFeaturedEvents(events, new Set([8, 1]), NOW);
    expect(picked.map((item) => item.title)).toEqual([
      'EDC Korea',
      'Tomorrowland',
      '风暴电音节',
      'EDC Thailand',
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
