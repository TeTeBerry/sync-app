import { t } from '@/i18n';
import type {
  TravelGuideBudgetTier,
  TravelGuideBudgetTierSnapshot,
} from '@/types/travelGuide';

const TIER_ORDER: TravelGuideBudgetTier[] = ['economy', 'standard', 'comfort'];

const FALLBACK_NIGHTLY_MID: Record<TravelGuideBudgetTier, number> = {
  economy: 225,
  standard: 450,
  comfort: 700,
};

function roundPrice(value: number): number {
  if (!Number.isFinite(value) || value <= 0) return 0;
  return value >= 1000 ? Math.round(value / 10) * 10 : Math.round(value);
}

function roomCount(headcount: number): number {
  if (headcount <= 1) return 1;
  return Math.ceil(headcount / 2);
}

function findSnapshot(
  tier: TravelGuideBudgetTier,
  snapshots?: TravelGuideBudgetTierSnapshot[],
): TravelGuideBudgetTierSnapshot | undefined {
  return snapshots?.find((item) => item.tier === tier);
}

/** 消除档位 nightly 区间重叠；保留后端 tier 身份，不按价重排。 */
export function normalizeBudgetTierSnapshotsForCompare(
  snapshots?: TravelGuideBudgetTierSnapshot[],
): TravelGuideBudgetTierSnapshot[] | undefined {
  if (!snapshots?.length || snapshots.length !== TIER_ORDER.length) {
    return snapshots;
  }

  const byTier = TIER_ORDER.map((tier) =>
    snapshots.find((item) => item.tier === tier),
  ).filter((item): item is TravelGuideBudgetTierSnapshot => Boolean(item));

  if (byTier.length === TIER_ORDER.length) {
    const mapped = byTier.map((snapshot) => ({
      ...snapshot,
      nightlyMin: roundPrice(snapshot.nightlyMin),
      nightlyMax: roundPrice(snapshot.nightlyMax),
    }));

    for (let i = 1; i < mapped.length; i++) {
      const prev = mapped[i - 1]!;
      const curr = mapped[i]!;
      if (curr.nightlyMin === prev.nightlyMin && curr.nightlyMax === prev.nightlyMax) {
        continue;
      }
      if (curr.nightlyMin < prev.nightlyMax) {
        curr.nightlyMin = roundPrice(prev.nightlyMax);
      }
      if (curr.nightlyMax < curr.nightlyMin) {
        const bump = Math.max(10, Math.round(curr.nightlyMin * 0.08));
        curr.nightlyMax = roundPrice(curr.nightlyMin + bump);
      }
    }

    return mapped;
  }

  const sorted = [...snapshots].sort(
    (a, b) =>
      a.nightlyMin - b.nightlyMin ||
      a.nightlyMax - b.nightlyMax ||
      TIER_ORDER.indexOf(a.tier) - TIER_ORDER.indexOf(b.tier),
  );

  const mapped = TIER_ORDER.map((tier, index) => ({
    ...sorted[index]!,
    tier,
    nightlyMin: roundPrice(sorted[index]!.nightlyMin),
    nightlyMax: roundPrice(sorted[index]!.nightlyMax),
  }));

  for (let i = 1; i < mapped.length; i++) {
    const prev = mapped[i - 1]!;
    const curr = mapped[i]!;
    if (curr.nightlyMin < prev.nightlyMax) {
      curr.nightlyMin = roundPrice(prev.nightlyMax);
    }
    if (curr.nightlyMax < curr.nightlyMin) {
      const bump = Math.max(10, Math.round(curr.nightlyMin * 0.08));
      curr.nightlyMax = roundPrice(curr.nightlyMin + bump);
    }
  }

  return mapped;
}

export function formatTravelGuideAccommodationEstimate(
  min: number,
  max: number,
): string {
  if (min === max) {
    return t('travelGuide.currencyApproxSingle', { amount: min });
  }
  return t('travelGuide.currencyApproxRange', { min, max });
}

export function formatBudgetTierNightlyHint(
  snapshot: TravelGuideBudgetTierSnapshot,
): string {
  const { nightlyMin, nightlyMax, currency = 'CNY' } = snapshot;
  const prefix = currency === 'USD' ? '$' : '¥';
  if (nightlyMin === nightlyMax) {
    return `${prefix}${nightlyMin}`;
  }
  return `${prefix}${nightlyMin}-${nightlyMax}`;
}

function tierAccommodationRange(input: {
  tier: TravelGuideBudgetTier;
  headcount: number;
  accommodationNights: number;
  budgetTierSnapshots?: TravelGuideBudgetTierSnapshot[];
}): { min: number; max: number } {
  const rooms = roomCount(input.headcount);
  const snapshot = findSnapshot(input.tier, input.budgetTierSnapshots);
  if (snapshot) {
    return {
      min: snapshot.nightlyMin * rooms * input.accommodationNights,
      max: snapshot.nightlyMax * rooms * input.accommodationNights,
    };
  }

  const hotelMid = FALLBACK_NIGHTLY_MID[input.tier];
  return {
    min: Math.round(hotelMid * 0.85) * rooms * input.accommodationNights,
    max: Math.round(hotelMid * 1.15) * rooms * input.accommodationNights,
  };
}

export function buildTravelGuideTierAccommodationEstimate(input: {
  tier: TravelGuideBudgetTier;
  headcount: number;
  accommodationNights: number;
  budgetTierSnapshots?: TravelGuideBudgetTierSnapshot[];
}): string {
  const { min, max } = tierAccommodationRange(input);
  return formatTravelGuideAccommodationEstimate(min, max);
}

export function buildTravelGuideTierCompareEstimates(input: {
  headcount: number;
  accommodationNights: number;
  budgetTierSnapshots?: TravelGuideBudgetTierSnapshot[];
}): Record<TravelGuideBudgetTier, string> {
  const snapshots = normalizeBudgetTierSnapshotsForCompare(input.budgetTierSnapshots);

  return TIER_ORDER.reduce(
    (acc, tier) => {
      acc[tier] = buildTravelGuideTierAccommodationEstimate({
        tier,
        headcount: input.headcount,
        accommodationNights: input.accommodationNights,
        budgetTierSnapshots: snapshots,
      });
      return acc;
    },
    {} as Record<TravelGuideBudgetTier, string>,
  );
}

export function buildTravelGuideTierCompareHints(input: {
  budgetTierSnapshots?: TravelGuideBudgetTierSnapshot[];
  t: (key: string) => string;
}): Record<TravelGuideBudgetTier, string> {
  const fallback: Record<TravelGuideBudgetTier, string> = {
    economy: input.t('travelPlan.budgetEconomyHint'),
    standard: input.t('travelPlan.budgetStandardHint'),
    comfort: input.t('travelPlan.budgetComfortHint'),
  };

  const snapshots = normalizeBudgetTierSnapshotsForCompare(input.budgetTierSnapshots);
  if (!snapshots?.length) return fallback;

  return TIER_ORDER.reduce(
    (acc, tier) => {
      const snapshot = findSnapshot(tier, snapshots);
      acc[tier] = snapshot ? formatBudgetTierNightlyHint(snapshot) : fallback[tier];
      return acc;
    },
    {} as Record<TravelGuideBudgetTier, string>,
  );
}
