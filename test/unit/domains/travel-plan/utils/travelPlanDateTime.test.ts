import { describe, expect, it } from 'vitest';
import { formatTravelPlanTimeLabel } from '@/domains/travel-plan/utils/travelPlanDateTime';

describe('formatTravelPlanTimeLabel', () => {
  it('shows hotel check-in and check-out dates on the label', () => {
    expect(
      formatTravelPlanTimeLabel({
        startDate: '2026-06-12',
        endDate: '2026-06-13',
      }),
    ).toBe('06/12–06/13');
  });

  it('shows transport departure and arrival times on the same-day label', () => {
    expect(
      formatTravelPlanTimeLabel({
        startDate: '2026-06-13',
        endDate: '2026-06-13',
        startTime: '12:55',
        endTime: '15:25',
      }),
    ).toBe('06/13 12:55–15:25');
  });
});
