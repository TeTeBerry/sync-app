import { useMemo, useState, useCallback } from 'react';
import type { EventDetailPost } from '@/types/post';
import {
  extractDepartureCityOptions,
  type EventDetailPostRuleFilters,
} from '../utils/filterEventDetailPostsByRules';

export function useEventDetailPostFilters(loadedPosts: EventDetailPost[]) {
  const [selectedCity, setSelectedCity] = useState('');

  const cityOptions = useMemo(
    () => extractDepartureCityOptions(loadedPosts),
    [loadedPosts],
  );

  const filters = useMemo<EventDetailPostRuleFilters>(
    () => ({
      departureCity: selectedCity.trim() || undefined,
    }),
    [selectedCity],
  );

  const isActive = Boolean(filters.departureCity);

  const clearFilters = useCallback(() => {
    setSelectedCity('');
  }, []);

  return {
    cityOptions,
    selectedCity,
    setSelectedCity,
    filters,
    isActive,
    clearFilters,
  };
}
