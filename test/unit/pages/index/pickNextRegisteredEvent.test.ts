import { describe, expect, it } from 'vitest';
import type { HomeSummary } from '@/types/backend';
import { pickNextRegisteredEvent } from '@/pages/index/utils/pickNextRegisteredEvent';

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
});
