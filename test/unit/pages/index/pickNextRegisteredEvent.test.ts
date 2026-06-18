import { describe, expect, it } from 'vitest';
import type { HomeSummary } from '@/types/backend';
import { pickNextRegisteredEvent } from '@/pages/index/utils/pickNextRegisteredEvent';

type SignupEvent = HomeSummary['signupEvents'][number];

function event(id: number, date: string, title = `Event ${id}`): SignupEvent {
  return {
    id,
    title,
    date,
    location: 'Shanghai',
    image: '',
    category: 'festival',
    hot: false,
    attendees: 10,
    going: true,
  };
}

describe('pickNextRegisteredEvent', () => {
  it('returns null when user has no registrations', () => {
    const events = [event(1, '2026-07-01')];
    expect(pickNextRegisteredEvent(events, new Set())).toBeNull();
  });

  it('returns nearest upcoming registered event', () => {
    const events = [
      event(1, '2026-08-01'),
      event(2, '2026-07-01'),
      event(3, '2026-09-01'),
    ];
    const registered = new Set([1, 2, 3]);
    const now = new Date('2026-06-01T00:00:00Z');

    expect(pickNextRegisteredEvent(events, registered, now)?.id).toBe(2);
  });

  it('ignores ended registered events', () => {
    const events = [event(1, '2025-01-01'), event(2, '2026-08-01')];
    const registered = new Set([1, 2]);
    const now = new Date('2026-06-01T00:00:00Z');

    expect(pickNextRegisteredEvent(events, registered, now)?.id).toBe(2);
  });
});
