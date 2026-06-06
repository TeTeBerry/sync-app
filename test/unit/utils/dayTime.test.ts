import { describe, expect, it } from 'vitest';
import { formatClockTime, formatTimeAgo, parseClockToMinutes } from '@/utils/dayTime';

describe('dayTime', () => {
  it('formatClockTime extracts HH:mm from a range', () => {
    expect(formatClockTime('20:30-22:00')).toBe('20:30');
    expect(formatClockTime('9:05')).toBe('09:05');
  });

  it('parseClockToMinutes parses normalized clock', () => {
    expect(parseClockToMinutes('20:30-22:00')).toBe(20 * 60 + 30);
  });

  it('formatTimeAgo uses absolute datetime after 24h when configured', () => {
    const iso = new Date(Date.now() - 25 * 3_600_000).toISOString();
    const label = formatTimeAgo(iso, { absoluteAfterHours: 24 });
    expect(label).toMatch(/\d{4}\/\d{2}\/\d{2}/);
  });

  it('formatTimeAgo shows minutes for recent times', () => {
    const iso = new Date(Date.now() - 5 * 60_000).toISOString();
    expect(formatTimeAgo(iso)).toBe('5 分钟前');
  });
});
