import { useEffect, useMemo, useRef, useState } from 'react';
import { searchBuddyPostsWithAi } from '../../../api/sync/posts';
import { isLiveApi } from '../../../constants/api';
import type { EventDetailPost } from '../../../types/post';
import { filterEventDetailPostsByQuery } from '../../../utils/buddyPostSearch';

const SEARCH_DEBOUNCE_MS = 280;

export type UseEventDetailPostSearchParams = {
  activityLegacyId?: number;
  loadedPosts: EventDetailPost[];
};

export function useEventDetailPostSearch({
  activityLegacyId,
  loadedPosts,
}: UseEventDetailPostSearchParams) {
  const [query, setQuery] = useState('');
  const [debouncedQuery, setDebouncedQuery] = useState('');
  const [apiResults, setApiResults] = useState<EventDetailPost[]>([]);
  const [isSearching, setIsSearching] = useState(false);
  const requestSeqRef = useRef(0);

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
      setIsSearching(false);
      return;
    }

    const requestSeq = ++requestSeqRef.current;
    setIsSearching(true);

    void searchBuddyPostsWithAi(debouncedQuery, activityLegacyId)
      .then((result) => {
        if (requestSeq !== requestSeqRef.current) return;
        setApiResults(result.items);
      })
      .catch(() => {
        if (requestSeq !== requestSeqRef.current) return;
        setApiResults([]);
      })
      .finally(() => {
        if (requestSeq !== requestSeqRef.current) return;
        setIsSearching(false);
      });
  }, [activityLegacyId, debouncedQuery, useRemoteSearch]);

  const matchedPosts = useMemo(() => {
    if (!isActive) return null;
    if (useRemoteSearch) {
      return debouncedQuery === trimmedQuery ? apiResults : [];
    }
    return filterEventDetailPostsByQuery(loadedPosts, trimmedQuery);
  }, [
    apiResults,
    debouncedQuery,
    isActive,
    loadedPosts,
    trimmedQuery,
    useRemoteSearch,
  ]);

  const clearSearch = () => {
    setQuery('');
    setDebouncedQuery('');
    setApiResults([]);
    setIsSearching(false);
  };

  return {
    query,
    setQuery,
    clearSearch,
    isActive,
    isSearching: useRemoteSearch && isSearching,
    matchedPosts,
    matchedCount: matchedPosts?.length ?? 0,
  };
}
