import type { PersonalityEventRecommendation, PersonalityTestResult } from '../types';

function normalizeDjName(name: string): string {
  return name.trim().toLowerCase();
}

function lineupDjIdFromName(name: string): string {
  return name
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/&/g, 'and')
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-|-$/g, '');
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
  const recommendationByName = new Map(
    [
      result.recommendations.soulMatch,
      ...result.recommendations.mustSee,
      ...result.recommendations.recommended,
    ].map((dj) => [normalizeDjName(dj.djName), dj]),
  );

  const selectedDjNames: string[] = [];
  const seenNames = new Set<string>();
  for (const name of targetEvent.matchedDjs) {
    const trimmed = name.trim();
    if (!trimmed) continue;
    const key = normalizeDjName(trimmed);
    if (seenNames.has(key)) continue;
    seenNames.add(key);
    selectedDjNames.push(trimmed);
  }

  const selectedDjIds = selectedDjNames.map((name) => {
    const matched = recommendationByName.get(normalizeDjName(name));
    return matched?.djId ?? lineupDjIdFromName(name);
  });

  const matchedNameSet = new Set(selectedDjNames.map(normalizeDjName));
  const soulName = result.recommendations.soulMatch.djName.trim();
  const spiritOrder = result.narrative.spiritConnections
    .map((entry) => entry.djName.trim())
    .filter((name) => matchedNameSet.has(normalizeDjName(name)));

  const focusDjName =
    (soulName && matchedNameSet.has(normalizeDjName(soulName))
      ? soulName
      : undefined) ??
    spiritOrder[0] ??
    selectedDjNames[0] ??
    soulName;

  return {
    selectedDjIds,
    selectedDjNames,
    focusDjName,
  };
}
