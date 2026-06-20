import { describe, expect, it } from 'vitest';
import {
  formatPostPublishTimeNative,
  formatClockTimeNative,
} from '@/utils/dateTimeNative';

describe('dateTimeNative', () => {
  it('formats relative post publish time', () => {
    const start = new Date(2026, 5, 20, 11, 30, 0);
    const iso = start.toISOString();
    const now = start.getTime() + 30 * 60_000;
    expect(formatPostPublishTimeNative(iso, now)).toBe('30 分钟前');
  });

  it('normalizes clock segments', () => {
    expect(formatClockTimeNative('20:30-22:00')).toBe('20:30');
    expect(formatClockTimeNative('9:05')).toBe('09:05');
  });
});
