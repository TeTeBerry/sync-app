import { beforeEach, describe, expect, it } from 'vitest';
import {
  buildTravelGuideTierAccommodationEstimate,
  buildTravelGuideTierCompareEstimates,
  buildTravelGuideTierCompareHints,
} from '@/domains/travel-guide/utils/travelGuideBudgetCompare.util';
import { useLocaleStore } from '@/i18n/localeStore';

describe('travelGuideBudgetCompare.util', () => {
  beforeEach(() => {
    useLocaleStore.setState({ locale: 'zh-CN' });
  });

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

  it('uses dynamic snapshots for tier hints and trip estimates', () => {
    const snapshots = [
      {
        tier: 'economy' as const,
        nightlyMin: 280,
        nightlyMax: 380,
        currency: 'CNY' as const,
      },
      {
        tier: 'standard' as const,
        nightlyMin: 400,
        nightlyMax: 520,
        currency: 'CNY' as const,
      },
      {
        tier: 'comfort' as const,
        nightlyMin: 650,
        nightlyMax: 900,
        currency: 'CNY' as const,
      },
    ];
    const hints = buildTravelGuideTierCompareHints({
      budgetTierSnapshots: snapshots,
      t: (key) => key,
    });
    expect(hints.standard).toBe('¥400-520');
    expect(
      buildTravelGuideTierAccommodationEstimate({
        tier: 'standard',
        headcount: 4,
        accommodationNights: 2,
        budgetTierSnapshots: snapshots,
      }),
    ).toBe('约 ¥1600–2080');
  });

  it('separates overlapping tier snapshots for stay totals', () => {
    const snapshots = [
      {
        tier: 'economy' as const,
        nightlyMin: 1120,
        nightlyMax: 2110,
        currency: 'CNY' as const,
      },
      {
        tier: 'standard' as const,
        nightlyMin: 1120,
        nightlyMax: 2880,
        currency: 'CNY' as const,
      },
      {
        tier: 'comfort' as const,
        nightlyMin: 4560,
        nightlyMax: 4560,
        currency: 'CNY' as const,
      },
    ];
    const estimates = buildTravelGuideTierCompareEstimates({
      headcount: 2,
      accommodationNights: 2,
      budgetTierSnapshots: snapshots,
    });

    expect(estimates.economy).toBe('约 ¥2240–4220');
    expect(estimates.standard).toBe('约 ¥4220–5760');
    expect(estimates.comfort).toBe('约 ¥9120');
  });
});
