import { describe, expect, it } from 'vitest';
import type { HomeSummary } from '@/types/backend';
import { pickNextSelectedEvent } from '@/pages/index/utils/pickNextSelectedEvent';

type HomeActivityEvent = HomeSummary['signupEvents'][number];

function event(id: number, date: string, title = `Event ${id}`): HomeActivityEvent {
  return {
    id,
    title,
    date,
    location: '',
    image: '',
    category: '电音节',
    hot: false,
    attendees: 0,
    going: false,
  };
}

describe('pickNextSelectedEvent', () => {
  const now = new Date(2026, 5, 1);

  it('returns null when user has no selections', () => {
    const events = [event(1, '06/13-14'), event(2, '10/03-04')];
    expect(pickNextSelectedEvent(events, new Set())).toBeNull();
  });

  it('returns nearest upcoming selected event', () => {
    const events = [event(1, '06/13-14'), event(2, '10/03-04'), event(3, '12/18-20')];
    const selected = new Set([1, 2, 3]);

    expect(pickNextSelectedEvent(events, selected, now)?.id).toBe(1);
  });

  it('skips ended selected events', () => {
    const events = [event(1, '01/01-02'), event(2, '10/03-04')];
    const selected = new Set([1, 2]);

    expect(pickNextSelectedEvent(events, selected, now)?.id).toBe(2);
  });
});
