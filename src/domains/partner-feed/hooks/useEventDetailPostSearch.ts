import Taro from '@tarojs/taro';
import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { searchBuddyPostsWithAi } from '../../../api/sync/posts';
import { isLiveApi } from '../../../constants/api';
import type { BuddyPostSearchParsed } from '../../../types/backend';
import type { EventDetailPost } from '@/types/partner';
import { ApiError, isApiAbortError } from '../../../utils/apiClient';
import {
  filterEventDetailPostsByQuery,
  resolveBuddySearchTerms,
} from '../../../utils/buddyPostSearch';
import {
  filterEventDetailPostsByRules,
  type EventDetailPostRuleFilters,
} from '../utils/filterEventDetailPostsByRules';

const SEARCH_DEBOUNCE_MS = 600;
const SEARCH_FAIL_TOAST = '搜索暂时不可用，请用关键词筛选或稍后再试';

function isSearchRateLimited(error: unknown): boolean {
  return (
    error instanceof ApiError &&
    (error.status === 429 ||
      error.message.includes('频繁') ||
      error.message.includes('rate limit'))
  );
}

export type UseEventDetailPostSearchParams = {
  activityLegacyId?: number;
  loadedPosts: EventDetailPost[];
  ruleFilters?: EventDetailPostRuleFilters;
  onTravelGuidePrefillDismiss?: (activityLegacyId: number, guideId: string) => void;
};

export function useEventDetailPostSearch({
  activityLegacyId,
  loadedPosts,
  ruleFilters = {},
  onTravelGuidePrefillDismiss,
}: UseEventDetailPostSearchParams) {
  const [query, setQueryState] = useState('');
  const [debouncedQuery, setDebouncedQuery] = useState('');
  const [apiResults, setApiResults] = useState<EventDetailPost[]>([]);
  const [searchParsed, setSearchParsed] = useState<BuddyPostSearchParsed | null>(null);
  const [isSearching, setIsSearching] = useState(false);
  const [usedLocalFallback, setUsedLocalFallback] = useState(false);
  const [travelGuidePrefillHint, setTravelGuidePrefillHint] = useState(false);
  const travelGuidePrefillGuideIdRef = useRef<string | null>(null);
  const requestSeqRef = useRef(0);
  const lastFailToastQueryRef = useRef('');

  const setQuery = useCallback(
    (next: string) => {
      if (
        !next.trim() &&
        travelGuidePrefillGuideIdRef.current &&
        activityLegacyId != null
      ) {
        onTravelGuidePrefillDismiss?.(
          activityLegacyId,
          travelGuidePrefillGuideIdRef.current,
        );
        travelGuidePrefillGuideIdRef.current = null;
        setTravelGuidePrefillHint(false);
      } else if (travelGuidePrefillHint) {
        setTravelGuidePrefillHint(false);
      }
      setQueryState(next);
    },
    [activityLegacyId, onTravelGuidePrefillDismiss, travelGuidePrefillHint],
  );

  const applyTravelGuidePrefill = useCallback((nextQuery: string, guideId: string) => {
    const trimmed = nextQuery.trim();
    if (!trimmed) return;
    travelGuidePrefillGuideIdRef.current = guideId.trim();
    setQueryState(trimmed);
    setDebouncedQuery(trimmed);
    setTravelGuidePrefillHint(true);
  }, []);

  const useRemoteSearch =
    isLiveApi() &&
    activityLegacyId != null &&
    !Number.isNaN(activityLegacyId) &&
    activityLegacyId > 0;

  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedQuery(query.trim());
    }, SEARCH_DEBOUNCE_MS);
    return () => clearTimeout(timer);
  }, [query]);

  const trimmedQuery = query.trim();
  const isActive = trimmedQuery.length > 0;

  useEffect(() => {
    if (!debouncedQuery || !useRemoteSearch || activityLegacyId == null) {
      setApiResults([]);
      setSearchParsed(null);
      setIsSearching(false);
      setUsedLocalFallback(false);
      return;
    }

    const controller = new AbortController();
    const requestSeq = ++requestSeqRef.current;
    setIsSearching(true);
    setUsedLocalFallback(false);
    setSearchParsed(null);

    void searchBuddyPostsWithAi(debouncedQuery, activityLegacyId, {
      signal: controller.signal,
    })
      .then((result) => {
        if (requestSeq !== requestSeqRef.current) return;
        setApiResults(result.items);
        setSearchParsed(result.parsed);
        setUsedLocalFallback(false);
      })
      .catch((error) => {
        if (requestSeq !== requestSeqRef.current) return;
        if (isApiAbortError(error)) return;

        setApiResults([]);
        setSearchParsed(null);
        const fallbackTerms = resolveBuddySearchTerms(debouncedQuery);
        if (fallbackTerms.length > 0) {
          setUsedLocalFallback(true);
        } else {
          setUsedLocalFallback(false);
        }

        if (
          !isSearchRateLimited(error) &&
          lastFailToastQueryRef.current !== debouncedQuery
        ) {
          lastFailToastQueryRef.current = debouncedQuery;
          void Taro.showToast({
            title: SEARCH_FAIL_TOAST,
            icon: 'none',
            duration: 3000,
          });
        }
      })
      .finally(() => {
        if (requestSeq !== requestSeqRef.current) return;
        setIsSearching(false);
      });

    return () => {
      controller.abort();
    };
  }, [activityLegacyId, debouncedQuery, useRemoteSearch]);

  const matchedPosts = useMemo(() => {
    if (!isActive) return null;

    const applyRuleFilters = (posts: EventDetailPost[]) =>
      filterEventDetailPostsByRules(posts, ruleFilters);

    if (useRemoteSearch) {
      if (debouncedQuery !== trimmedQuery) {
        return [];
      }
      if (usedLocalFallback) {
        return filterEventDetailPostsByQuery(loadedPosts, trimmedQuery);
      }
      return applyRuleFilters(apiResults);
    }

    return filterEventDetailPostsByQuery(loadedPosts, trimmedQuery);
  }, [
    apiResults,
    debouncedQuery,
    isActive,
    loadedPosts,
    ruleFilters,
    trimmedQuery,
    useRemoteSearch,
    usedLocalFallback,
  ]);

  const clearSearch = useCallback(() => {
    if (
      travelGuidePrefillGuideIdRef.current &&
      activityLegacyId != null &&
      onTravelGuidePrefillDismiss
    ) {
      onTravelGuidePrefillDismiss(
        activityLegacyId,
        travelGuidePrefillGuideIdRef.current,
      );
    }
    travelGuidePrefillGuideIdRef.current = null;
    setTravelGuidePrefillHint(false);
    setQueryState('');
    setDebouncedQuery('');
    setApiResults([]);
    setSearchParsed(null);
    setIsSearching(false);
    setUsedLocalFallback(false);
    lastFailToastQueryRef.current = '';
  }, [activityLegacyId, onTravelGuidePrefillDismiss]);

  return {
    query,
    setQuery,
    applyTravelGuidePrefill,
    clearSearch,
    isActive,
    isSearching: useRemoteSearch && isSearching,
    matchedPosts,
    matchedCount: matchedPosts?.length ?? 0,
    usedLocalFallback,
    searchParsed: usedLocalFallback ? null : searchParsed,
    travelGuidePrefillHint,
  };
}
