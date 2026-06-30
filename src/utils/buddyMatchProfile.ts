import { resolvePrimaryGenreCategory } from '@/packageEvent/pages/exclusive-itinerary/exclusiveItineraryFilters';
import type { CurrentUser } from '../types/backend';
import { normalizeUserCity } from './normalizeUserProfileText';

export type BuddyMatchProfile = {
  city?: string;
  favorGenres?: string[];
  budgetLevel?: string;
};

export function hasGenrePreferences(profile?: BuddyMatchProfile | null): boolean {
  return Boolean(profile?.favorGenres?.length);
}

/** Normalized genre tokens from saved user preferences (incl. primary buckets). */
export function buildUserGenreMatchSet(favorGenres?: string[] | null): Set<string> {
  const set = new Set<string>();
  for (const raw of favorGenres ?? []) {
    const trimmed = raw.trim();
    if (!trimmed) {
      continue;
    }
    set.add(trimmed.toLowerCase());
    const primary = resolvePrimaryGenreCategory(trimmed);
    if (primary) {
      set.add(primary.toLowerCase());
    }
  }
  return set;
}

export function toBuddyMatchProfile(
  user?: Pick<CurrentUser, 'city' | 'favorGenres' | 'budgetLevel'> | null,
): BuddyMatchProfile | null {
  if (!user) {
    return null;
  }
  const city = normalizeUserCity(user.city);
  const favorGenres = (user.favorGenres ?? [])
    .map((genre) => genre.trim())
    .filter(Boolean);
  const budgetLevel = user.budgetLevel?.trim();
  if (!city && !favorGenres.length && !budgetLevel) {
    return null;
  }
  return {
    ...(city ? { city } : {}),
    ...(favorGenres.length ? { favorGenres } : {}),
    ...(budgetLevel ? { budgetLevel } : {}),
  };
}
