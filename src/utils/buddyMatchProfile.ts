import { resolvePrimaryGenreCategory } from '@/packageEvent/pages/exclusive-itinerary/exclusiveItineraryFilters';
import type { CurrentUser } from '../types/backend';

export type BuddyMatchProfile = {
  city?: string;
  favorGenres?: string[];
  budgetLevel?: string;
};

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
  return {
    city: user.city,
    favorGenres: user.favorGenres,
    budgetLevel: user.budgetLevel,
  };
}
