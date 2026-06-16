import type { RecommendDjLineupResult } from '../types';

export function getPreferredDjIdsForItinerary(
  recommendations: RecommendDjLineupResult,
): string[] {
  const ids = [
    recommendations.soulMatch.djId,
    ...recommendations.mustSee.map((item) => item.djId),
    ...recommendations.recommended.map((item) => item.djId),
  ];
  return ids.filter((id, index) => ids.indexOf(id) === index);
}
