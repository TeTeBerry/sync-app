import Taro from '@tarojs/taro';
import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { runScene } from '../../../api/sync/sceneRun';
import { isLiveApi } from '../../../constants/api';
import type { BuddyPostSearchParsed } from '../../../types/backend';
import type { EventDetailPost } from '@/types/partner';
import { ApiError, isApiAbortError } from '../../../utils/apiClient';
import {
  applySceneEffects,
  findSceneInsightLine,
  type SceneInsightLine,
} from '../../scene-agent/applySceneEffects';
import {
  filterEventDetailPostsByQuery,
  resolveBuddySearchTerms,
} from '../../../utils/buddyPostSearch';
import {
  filterEventDetailPostsByRules,
  type EventDetailPostRuleFilters,
} from '../utils/filterEventDetailPostsByRules';
import { showAppToast } from '@/utils/appToast';

const SEARCH_DEBOUNCE_MS = 600;
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
  applyPreferenceRank?: boolean;
};

export function useEventDetailPostSearch({
  activityLegacyId,
  loadedPosts,
  ruleFilters = {},
  onTravelGuidePrefillDismiss,
  applyPreferenceRank = true,
}: UseEventDetailPostSearchParams) {
  const [query, setQueryState] = useState('');
  const [debouncedQuery, setDebouncedQuery] = useState('');
  const [apiResults, setApiResults] = useState<EventDetailPost[]>([]);
  const [searchParsed, setSearchParsed] = useState<BuddyPostSearchParsed | null>(null);
  const [sceneInsightLines, setSceneInsightLines] = useState<SceneInsightLine[]>([]);
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

  const applySearchPrefill = useCallback((nextQuery: string) => {
    const trimmed = nextQuery.trim();
    if (!trimmed) return;
    travelGuidePrefillGuideIdRef.current = null;
    setTravelGuidePrefillHint(false);
    setQueryState(trimmed);
    setDebouncedQuery(trimmed);
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
      setSceneInsightLines([]);
      setIsSearching(false);
      setUsedLocalFallback(false);
      return;
    }

    const controller = new AbortController();
    const requestSeq = ++requestSeqRef.current;
    setIsSearching(true);
    setUsedLocalFallback(false);
    setSearchParsed(null);
    setSceneInsightLines([]);

    void runScene(
      {
        scene: 'recruit_search',
        intent: 'search',
        activityLegacyId,
        input: debouncedQuery,
        context: {
          trigger: 'search',
          applyPreferenceRank,
        },
      },
      { signal: controller.signal },
    )
      .then((response) => {
        if (requestSeq !== requestSeqRef.current) return;
        const applied = applySceneEffects(response.effects);
        setSceneInsightLines(applied.insightLines);
        setApiResults(applied.reorderPosts?.items ?? []);
        setSearchParsed(applied.reorderPosts?.parsed ?? null);
        setUsedLocalFallback(false);
      })
      .catch((error) => {
        if (requestSeq !== requestSeqRef.current) return;
        if (isApiAbortError(error)) return;

        setApiResults([]);
        setSearchParsed(null);
        setSceneInsightLines([]);
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
          showAppToast('eventDetail.buddySearchFailed', {
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
  }, [activityLegacyId, applyPreferenceRank, debouncedQuery, useRemoteSearch]);

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
    setSceneInsightLines([]);
    setIsSearching(false);
    setUsedLocalFallback(false);
    lastFailToastQueryRef.current = '';
  }, [activityLegacyId, onTravelGuidePrefillDismiss]);

  return {
    query,
    setQuery,
    applyTravelGuidePrefill,
    applySearchPrefill,
    clearSearch,
    isActive,
    isSearching: useRemoteSearch && isSearching,
    matchedPosts,
    matchedCount: matchedPosts?.length ?? 0,
    usedLocalFallback,
    searchParsed: usedLocalFallback ? null : searchParsed,
    sceneParsedInsight: usedLocalFallback
      ? null
      : findSceneInsightLine(sceneInsightLines, 'parsed'),
    scenePreferenceInsight: usedLocalFallback
      ? null
      : findSceneInsightLine(sceneInsightLines, 'preference'),
    travelGuidePrefillHint,
  };
}
