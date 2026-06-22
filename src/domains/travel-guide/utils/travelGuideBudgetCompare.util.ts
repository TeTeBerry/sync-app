import type { TravelGuideBudgetTier } from '@/types/travelGuide';

const TIER_NIGHTLY_MID: Record<TravelGuideBudgetTier, number> = {
  economy: 225,
  standard: 450,
  comfort: 700,
};

function roomCount(headcount: number): number {
  if (headcount <= 1) return 1;
  return Math.ceil(headcount / 2);
}

export function formatTravelGuideAccommodationEstimate(
  min: number,
  max: number,
): string {
  if (min === max) return `约 ¥${min}`;
  return `约 ¥${min}–${max}`;
}

export function buildTravelGuideTierAccommodationEstimate(input: {
  tier: TravelGuideBudgetTier;
  headcount: number;
  accommodationNights: number;
}): string {
  const rooms = roomCount(input.headcount);
  const hotelMid = TIER_NIGHTLY_MID[input.tier];
  const min = Math.round(hotelMid * 0.85) * rooms * input.accommodationNights;
  const max = Math.round(hotelMid * 1.15) * rooms * input.accommodationNights;
  return formatTravelGuideAccommodationEstimate(min, max);
}

export function buildTravelGuideTierCompareEstimates(input: {
  headcount: number;
  accommodationNights: number;
}): Record<TravelGuideBudgetTier, string> {
  const tiers: TravelGuideBudgetTier[] = ['economy', 'standard', 'comfort'];
  return tiers.reduce(
    (acc, tier) => {
      acc[tier] = buildTravelGuideTierAccommodationEstimate({
        tier,
        headcount: input.headcount,
        accommodationNights: input.accommodationNights,
      });
      return acc;
    },
    {} as Record<TravelGuideBudgetTier, string>,
  );
}
