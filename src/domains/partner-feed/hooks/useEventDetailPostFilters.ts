import { useMemo, useState, useCallback } from 'react';
import type { EventDetailPost } from '@/types/partner';
import {
  extractDepartureCityOptions,
  type EventDetailPostRuleFilters,
} from '../utils/filterEventDetailPostsByRules';

export function useEventDetailPostFilters(loadedPosts: EventDetailPost[]) {
  const [selectedCity, setSelectedCity] = useState('');
  const [recruitingOnly, setRecruitingOnly] = useState(false);

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
  };
}
