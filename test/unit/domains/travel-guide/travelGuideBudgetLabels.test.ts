import { describe, expect, it } from 'vitest';
import {
  DEFAULT_TRAVEL_GUIDE_BUDGET_TIER,
  resolveTravelGuideBudgetTier,
} from '@/domains/travel-guide/utils/travelGuideBudgetLabels';

describe('travelGuideBudgetLabels', () => {
  it('defaults missing budget tier to standard (舒适)', () => {
    expect(DEFAULT_TRAVEL_GUIDE_BUDGET_TIER).toBe('standard');
    expect(resolveTravelGuideBudgetTier(undefined)).toBe('standard');
    expect(resolveTravelGuideBudgetTier(null)).toBe('standard');
  });

  it('preserves explicit budget tiers', () => {
    expect(resolveTravelGuideBudgetTier('economy')).toBe('economy');
    expect(resolveTravelGuideBudgetTier('comfort')).toBe('comfort');
  });
});
