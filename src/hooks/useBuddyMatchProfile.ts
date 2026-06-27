import {
  formatBuddyPreferencesSummary,
  hasBuddyPreferenceSignal,
} from '../constants/buddyPreferences';
import { useBuddyMatchProfileStore } from '../stores/buddyMatchProfileStore';
import type { BuddyMatchProfile } from '../utils/buddyMatchProfile';

/** Cross-page buddy match profile (city / genres / budget) synced from `users/me`. */
export function useBuddyMatchProfile(): {
  profile: BuddyMatchProfile | null;
  favorGenres?: string[];
  city?: string;
  budgetLevel?: string;
  hasPreferenceSignal: boolean;
  preferencesSummary: string;
} {
  const profile = useBuddyMatchProfileStore((state) => state.profile);
  return {
    profile,
    favorGenres: profile?.favorGenres,
    city: profile?.city,
    budgetLevel: profile?.budgetLevel,
    hasPreferenceSignal: hasBuddyPreferenceSignal(profile),
    preferencesSummary: formatBuddyPreferencesSummary(profile),
  };
}
