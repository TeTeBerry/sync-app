import { describe, expect, it } from 'vitest';
import {
  buildTravelGuideTierAccommodationEstimate,
  buildTravelGuideTierCompareEstimates,
} from '@/domains/travel-guide/utils/travelGuideBudgetCompare.util';

describe('travelGuideBudgetCompare.util', () => {
  it('builds accommodation estimate from tier, headcount, and nights', () => {
    expect(
      buildTravelGuideTierAccommodationEstimate({
        tier: 'standard',
        headcount: 2,
        accommodationNights: 2,
      }),
    ).toBe('约 ¥766–1036');
  });

  it('builds all three tier estimates', () => {
    const estimates = buildTravelGuideTierCompareEstimates({
      headcount: 4,
      accommodationNights: 3,
    });
    expect(estimates.economy).toMatch(/^约 ¥/);
    expect(estimates.standard).toMatch(/^约 ¥/);
    expect(estimates.comfort).toMatch(/^约 ¥/);
    expect(
      new Set([estimates.economy, estimates.standard, estimates.comfort]).size,
    ).toBe(3);
  });
});
