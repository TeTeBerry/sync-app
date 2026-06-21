import Taro from '@tarojs/taro';
import { useEffect, useMemo, useRef, useState } from 'react';
import { searchBuddyPostsWithAi } from '../../../api/sync/posts';
import { isLiveApi } from '../../../constants/api';
import type { BuddyPostSearchParsed } from '../../../types/backend';
import type { EventDetailPost } from '../../../types/post';
import {
  filterEventDetailPostsByQuery,
  resolveBuddySearchTerms,
} from '../../../utils/buddyPostSearch';

const SEARCH_DEBOUNCE_MS = 280;
const SEARCH_FAIL_TOAST = '搜索暂时不可用，请用关键词筛选或稍后再试';

export type UseEventDetailPostSearchParams = {
  activityLegacyId?: number;
  loadedPosts: EventDetailPost[];
  ruleFiltersActive?: boolean;
};

export function useEventDetailPostSearch({
  activityLegacyId,
  loadedPosts,
  ruleFiltersActive = false,
}: UseEventDetailPostSearchParams) {
  const [query, setQuery] = useState('');
  const [debouncedQuery, setDebouncedQuery] = useState('');
  const [apiResults, setApiResults] = useState<EventDetailPost[]>([]);
  const [searchParsed, setSearchParsed] = useState<BuddyPostSearchParsed | null>(null);
  const [isSearching, setIsSearching] = useState(false);
  const [usedLocalFallback, setUsedLocalFallback] = useState(false);
  const requestSeqRef = useRef(0);
  const lastFailToastQueryRef = useRef('');

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

    const requestSeq = ++requestSeqRef.current;
    setIsSearching(true);
    setUsedLocalFallback(false);
    setSearchParsed(null);

    void searchBuddyPostsWithAi(debouncedQuery, activityLegacyId)
      .then((result) => {
        if (requestSeq !== requestSeqRef.current) return;
        setApiResults(result.items);
        setSearchParsed(result.parsed);
        setUsedLocalFallback(false);
      })
      .catch(() => {
        if (requestSeq !== requestSeqRef.current) return;
        setApiResults([]);
        setSearchParsed(null);
        const fallbackTerms = resolveBuddySearchTerms(trimmedQuery);
        if (!ruleFiltersActive && fallbackTerms.length > 0) {
          setUsedLocalFallback(true);
        } else {
          setUsedLocalFallback(false);
        }
        if (lastFailToastQueryRef.current !== debouncedQuery) {
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
  }, [
    activityLegacyId,
    debouncedQuery,
    ruleFiltersActive,
    trimmedQuery,
    useRemoteSearch,
  ]);

  const matchedPosts = useMemo(() => {
    if (!isActive) return null;

    if (useRemoteSearch) {
      if (debouncedQuery !== trimmedQuery) {
        return [];
      }
      if (usedLocalFallback) {
        return filterEventDetailPostsByQuery(loadedPosts, trimmedQuery);
      }
      return apiResults;
    }

    return filterEventDetailPostsByQuery(loadedPosts, trimmedQuery);
  }, [
    apiResults,
    debouncedQuery,
    isActive,
    loadedPosts,
    trimmedQuery,
    useRemoteSearch,
    usedLocalFallback,
  ]);

  const clearSearch = () => {
    setQuery('');
    setDebouncedQuery('');
    setApiResults([]);
    setSearchParsed(null);
    setIsSearching(false);
    setUsedLocalFallback(false);
    lastFailToastQueryRef.current = '';
  };

  return {
    query,
    setQuery,
    clearSearch,
    isActive,
    isSearching: useRemoteSearch && isSearching,
    matchedPosts,
    matchedCount: matchedPosts?.length ?? 0,
    usedLocalFallback,
    searchParsed: usedLocalFallback ? null : searchParsed,
  };
}
