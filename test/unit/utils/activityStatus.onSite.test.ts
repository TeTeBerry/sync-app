import { describe, expect, it } from 'vitest';
import {
  getActivityStatusFromActivity,
  isActivityOnSite,
} from '@/utils/activityStatus';

describe('isActivityOnSite', () => {
  const during = new Date(2026, 5, 13, 12, 0, 0, 0);
  const before = new Date(2026, 3, 1, 12, 0, 0, 0);
  const after = new Date(2026, 6, 1, 12, 0, 0, 0);

  it('is true during the event calendar range', () => {
    expect(isActivityOnSite('06/13-14', 'Fest 2026', during)).toBe(true);
  });

  it('is false before the event start day', () => {
    expect(isActivityOnSite('06/13-14', 'Fest 2026', before)).toBe(false);
  });

  it('is false after the event end day', () => {
    expect(isActivityOnSite('06/13-14', 'Fest 2026', after)).toBe(false);
  });

  it('is false in the pre-event 45-day window where status is pre_event', () => {
    const preWindow = new Date(2026, 4, 1, 12, 0, 0, 0);
    expect(getActivityStatusFromActivity('06/13-14', 'Fest 2026', preWindow)).toBe(
      'pre_event',
    );
    expect(isActivityOnSite('06/13-14', 'Fest 2026', preWindow)).toBe(false);
  });
});
