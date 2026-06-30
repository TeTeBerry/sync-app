import {
  formatBuddyPreferencesSummary,
  hasBuddyPreferenceSignal,
} from '../constants/buddyPreferences';
import { useBuddyMatchProfileStore } from '../stores/buddyMatchProfileStore';
import {
  hasGenrePreferences,
  type BuddyMatchProfile,
} from '../utils/buddyMatchProfile';

/** Cross-page buddy match profile (city / genres / budget) synced from `users/me`. */
export function useBuddyMatchProfile(): {
  profile: BuddyMatchProfile | null;
  favorGenres?: string[];
  city?: string;
  budgetLevel?: string;
  hydrated: boolean;
  hasGenrePreferences: boolean;
  hasPreferenceSignal: boolean;
  preferencesSummary: string;
} {
  const profile = useBuddyMatchProfileStore((state) => state.profile);
  const hydrated = useBuddyMatchProfileStore((state) => state.hydrated);
  return {
    profile,
    favorGenres: profile?.favorGenres,
    city: profile?.city,
    budgetLevel: profile?.budgetLevel,
    hydrated,
    hasGenrePreferences: hasGenrePreferences(profile),
    hasPreferenceSignal: hasBuddyPreferenceSignal(profile),
    preferencesSummary: formatBuddyPreferencesSummary(profile),
  };
}
