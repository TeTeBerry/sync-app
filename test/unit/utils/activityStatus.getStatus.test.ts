import { describe, expect, it } from 'vitest';
import {
  activityStatusI18nKey,
  getActivityStatusFromActivity,
} from '@/utils/activityStatus';

describe('getActivityStatusFromActivity', () => {
  const title = 'World DJ Festival Japan 2026';
  const date = '07/04-05';

  it('returns not_started more than 45 days before the festival', () => {
    expect(
      getActivityStatusFromActivity(date, title, new Date(2026, 3, 1, 12, 0, 0, 0)),
    ).toBe('not_started');
  });

  it('returns pre_event within 45 days before opening day', () => {
    expect(
      getActivityStatusFromActivity(date, title, new Date(2026, 5, 29, 12, 0, 0, 0)),
    ).toBe('pre_event');
  });

  it('returns in_progress only during festival calendar days', () => {
    expect(
      getActivityStatusFromActivity(date, title, new Date(2026, 6, 4, 12, 0, 0, 0)),
    ).toBe('in_progress');
    expect(
      getActivityStatusFromActivity(date, title, new Date(2026, 6, 5, 20, 0, 0, 0)),
    ).toBe('in_progress');
  });

  it('returns ended after the festival', () => {
    expect(
      getActivityStatusFromActivity(date, title, new Date(2026, 6, 6, 0, 0, 0, 0)),
    ).toBe('ended');
  });
});

describe('activityStatusI18nKey', () => {
  it('maps pre_event to warm-up copy', () => {
    expect(activityStatusI18nKey('pre_event')).toBe('activityInfo.status.preEvent');
  });
});
