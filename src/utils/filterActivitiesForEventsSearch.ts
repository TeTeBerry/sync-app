import { ACTIVITY_MAP_REGION_LABELS } from '../constants/activityMapRegion';
import { HOME_FESTIVAL_SHORTCUT_CHIPS } from '../constants/homeFestivalShortcuts';
import type { EventCardUi } from './apiMappers';

function normalizeForMatch(text: string): string {
  return text.trim().toLowerCase();
}

function eventSearchHaystack(event: EventCardUi): string {
  const regionLabel = event.region ? ACTIVITY_MAP_REGION_LABELS[event.region] : '';
  return [
    event.title,
    event.location,
    event.category,
    regionLabel,
    ...(event.alias ?? []),
  ]
    .filter(Boolean)
    .join(' ');
}

function expandQueryTerms(query: string): string[] {
  const normalized = normalizeForMatch(query);
  const terms = new Set<string>();
  if (normalized) {
    terms.add(normalized);
  }

  for (const chip of HOME_FESTIVAL_SHORTCUT_CHIPS) {
    const chipHaystack = [chip.key, chip.label, chip.submitText, chip.fallbackTitle]
      .map(normalizeForMatch)
      .join(' ');
    if (
      normalized &&
      (chipHaystack.includes(normalized) ||
        normalized.includes(chip.key) ||
        normalized.includes(normalizeForMatch(chip.label)))
    ) {
      terms.add(normalizeForMatch(chip.label));
      terms.add(normalizeForMatch(chip.submitText));
      terms.add(chip.key);
    }
  }

  return Array.from(terms).filter(Boolean);
}

/** Client-side filter for events list tab (title, location, category + festival aliases). */
export function filterActivitiesForEventsSearch(
  events: EventCardUi[],
  query: string,
): EventCardUi[] {
  const trimmed = query.trim();
  if (!trimmed) {
    return events;
  }

  const terms = expandQueryTerms(trimmed);
  return events.filter((event) => {
    const haystack = normalizeForMatch(eventSearchHaystack(event));
    return terms.some((term) => haystack.includes(term));
  });
}
