import { useMemo, useState, useCallback, useEffect } from 'react';
import type { EventDetailPost } from '@/types/partner';
import {
  readProfilePreferenceSortEnabled,
  writeProfilePreferenceSortEnabled,
} from '../../../utils/profileStorage';
import { useBuddyMatchProfile } from '../../../hooks/useBuddyMatchProfile';
import {
  extractDepartureCityOptions,
  type EventDetailPostRuleFilters,
} from '../utils/filterEventDetailPostsByRules';

export function useEventDetailPostFilters(loadedPosts: EventDetailPost[]) {
  const [selectedCity, setSelectedCity] = useState('');
  const [recruitingOnly, setRecruitingOnly] = useState(false);
  const { hasPreferenceSignal } = useBuddyMatchProfile();
  const [preferenceSortEnabled, setPreferenceSortEnabledState] = useState(() =>
    readProfilePreferenceSortEnabled(),
  );

  useEffect(() => {
    if (!hasPreferenceSignal && preferenceSortEnabled) {
      setPreferenceSortEnabledState(false);
    }
  }, [hasPreferenceSignal, preferenceSortEnabled]);

  const setPreferenceSortEnabled = useCallback((next: boolean) => {
    setPreferenceSortEnabledState(next);
    writeProfilePreferenceSortEnabled(next);
  }, []);

  const cityOptions = useMemo(
    () => extractDepartureCityOptions(loadedPosts),
    [loadedPosts],
  );

  const filters = useMemo<EventDetailPostRuleFilters>(
    () => ({
      departureCity: selectedCity.trim() || undefined,
      recruitingOnly: recruitingOnly || undefined,
    }),
    [recruitingOnly, selectedCity],
  );

  const isActive = Boolean(filters.departureCity || filters.recruitingOnly);

  const clearFilters = useCallback(() => {
    setSelectedCity('');
    setRecruitingOnly(false);
  }, []);

  return {
    cityOptions,
    selectedCity,
    setSelectedCity,
    recruitingOnly,
    setRecruitingOnly,
    filters,
    isActive,
    clearFilters,
    preferenceSortEnabled: hasPreferenceSignal && preferenceSortEnabled,
    setPreferenceSortEnabled,
  };
}
