import type { PersonalityEventRecommendation, PersonalityTestResult } from '../types';

function normalizeDjName(name: string): string {
  return name.trim().toLowerCase();
}

export type PersonalityItinerarySelection = {
  selectedDjIds: string[];
  selectedDjNames: string[];
  focusDjName: string;
};

export function buildPersonalityItinerarySelection(
  result: PersonalityTestResult,
  targetEvent: PersonalityEventRecommendation,
): PersonalityItinerarySelection {
  const eventDjNames = new Set(
    targetEvent.matchedDjs.map((name) => normalizeDjName(name)),
  );

  const recommendationPool = [
    result.recommendations.soulMatch,
    ...result.recommendations.mustSee,
    ...result.recommendations.recommended,
  ];

  const seenIds = new Set<string>();
  const inEvent = recommendationPool.filter((dj) => {
    if (!eventDjNames.has(normalizeDjName(dj.djName))) {
      return false;
    }
    if (seenIds.has(dj.djId)) {
      return false;
    }
    seenIds.add(dj.djId);
    return true;
  });

  const spiritOrder = result.narrative.spiritConnections
    .map((entry) => entry.djName.trim())
    .filter((name) => eventDjNames.has(normalizeDjName(name)));

  const focusDjName =
    spiritOrder[0] ?? inEvent[0]?.djName ?? result.recommendations.soulMatch.djName;

  return {
    selectedDjIds: inEvent.map((dj) => dj.djId),
    selectedDjNames: inEvent.map((dj) => dj.djName),
    focusDjName,
  };
}
