import Taro from '@tarojs/taro';
import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { runScene } from '@/api/sync/sceneRun';
import { isLiveApi } from '@/constants/api';
import { applySceneEffects } from '@/domains/scene-agent/applySceneEffects';
import { shouldTriggerEventsAiSearch } from '@/domains/events-search/utils/shouldTriggerEventsAiSearch';
import { useLocale, useT } from '@/hooks/useI18n';
import type { KnowledgeCardPayload } from '@sync/scene-contracts';
import { ApiError, isApiAbortError } from '@/utils/apiClient';
import type { EventCardUi } from '@/utils/apiMappers';
import { resolveEventCardLegacyId } from '@/utils/apiMappers';
import { filterActivitiesForEventsSearch } from '@/utils/filterActivitiesForEventsSearch';

const SEARCH_DEBOUNCE_MS = 600;
const SEARCH_FAIL_TOAST = 'AI 资讯暂时不可用，请用关键词筛选或稍后再试';

function isSearchRateLimited(error: unknown): boolean {
  return (
    error instanceof ApiError &&
    (error.status === 429 ||
      error.message.includes('频繁') ||
      error.message.includes('rate limit'))
  );
}

export function useEventsSearch(events: EventCardUi[]) {
  const locale = useLocale();
  const t = useT();
  const eventsRef = useRef(events);
  const tRef = useRef(t);
  eventsRef.current = events;
  tRef.current = t;
  const [query, setQuery] = useState('');
  const [debouncedQuery, setDebouncedQuery] = useState('');
  const [knowledgeCard, setKnowledgeCard] = useState<KnowledgeCardPayload | null>(null);
  const [parsedInsight, setParsedInsight] = useState<string | null>(null);
  const [filterLegacyIds, setFilterLegacyIds] = useState<number[] | null>(null);
  const [isSearching, setIsSearching] = useState(false);
  const [usedLocalFallback, setUsedLocalFallback] = useState(false);
  const [isAiSearchActive, setIsAiSearchActive] = useState(false);
  const requestSeqRef = useRef(0);
  const lastFailToastQueryRef = useRef('');

  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedQuery(query.trim());
    }, SEARCH_DEBOUNCE_MS);
    return () => clearTimeout(timer);
  }, [query]);

  const trimmedQuery = query.trim();
  const isActive = trimmedQuery.length > 0;

  const localFilteredEvents = useMemo(
    () => filterActivitiesForEventsSearch(events, trimmedQuery),
    [events, trimmedQuery],
  );

  useEffect(() => {
    const query = debouncedQuery.trim();
    if (!isLiveApi() || !query) {
      setIsAiSearchActive(false);
      setKnowledgeCard(null);
      setParsedInsight(null);
      setFilterLegacyIds(null);
      setIsSearching(false);
      setUsedLocalFallback(false);
      return;
    }

    const localMatchCount = filterActivitiesForEventsSearch(
      eventsRef.current,
      query,
    ).length;
    if (!shouldTriggerEventsAiSearch(query, localMatchCount)) {
      setIsAiSearchActive(false);
      setKnowledgeCard(null);
      setParsedInsight(null);
      setFilterLegacyIds(null);
      setIsSearching(false);
      setUsedLocalFallback(false);
      return;
    }

    const requestSeq = ++requestSeqRef.current;
    setIsAiSearchActive(true);
    setIsSearching(true);
    setUsedLocalFallback(false);
    setKnowledgeCard(null);
    setParsedInsight(null);
    setFilterLegacyIds(null);

    void runScene({
      scene: 'events_knowledge_search',
      intent: 'search',
      input: query,
      context: {
        trigger: 'search',
        locale,
      },
    })
      .then((response) => {
        if (requestSeq !== requestSeqRef.current) return;
        const applied = applySceneEffects(response.effects);
        setKnowledgeCard(applied.knowledgeCard);
        setParsedInsight(
          applied.insightLines.find((line) => line.variant === 'knowledge')?.text ??
            applied.insightLines[0]?.text ??
            null,
        );
        setFilterLegacyIds(applied.filterActivities?.activityLegacyIds ?? null);
        setUsedLocalFallback(false);
      })
      .catch((error) => {
        if (requestSeq !== requestSeqRef.current) return;
        if (isApiAbortError(error)) return;

        const localMatches = filterActivitiesForEventsSearch(eventsRef.current, query);

        setKnowledgeCard({
          title: tRef.current('events.knowledge.fallbackTitle'),
          sections: [
            {
              body:
                localMatches.length > 0
                  ? tRef.current('events.knowledge.offlineMatched', {
                      count: localMatches.length,
                    })
                  : tRef.current('events.knowledge.offlineFallback'),
            },
          ],
          sources: [tRef.current('events.knowledge.fallbackSource')],
          aiGenerated: false,
          links: localMatches.slice(0, 4).map((event) => ({
            label: event.title,
            activityLegacyId: resolveEventCardLegacyId(event.id) ?? undefined,
          })),
        });
        setParsedInsight(null);
        setFilterLegacyIds(
          localMatches
            .map((event) => resolveEventCardLegacyId(event.id))
            .filter((id): id is number => id != null),
        );
        setUsedLocalFallback(true);

        if (
          localMatches.length === 0 &&
          query !== lastFailToastQueryRef.current &&
          !isSearchRateLimited(error)
        ) {
          lastFailToastQueryRef.current = query;
          Taro.showToast({ title: SEARCH_FAIL_TOAST, icon: 'none' });
        }
      })
      .finally(() => {
        if (requestSeq === requestSeqRef.current) {
          setIsSearching(false);
        }
      });

    return () => {
      requestSeqRef.current += 1;
    };
  }, [debouncedQuery, locale]);

  const filteredEvents = useMemo(() => {
    if (!isActive) {
      return null;
    }

    if (!isAiSearchActive) {
      return localFilteredEvents;
    }

    if (debouncedQuery !== trimmedQuery) {
      return localFilteredEvents;
    }

    if (usedLocalFallback) {
      return localFilteredEvents;
    }

    if (isSearching && filterLegacyIds == null) {
      return [];
    }

    if (filterLegacyIds != null) {
      if (!filterLegacyIds.length) {
        return [];
      }
      const idSet = new Set(filterLegacyIds);
      return events.filter((event) => {
        const legacyId = resolveEventCardLegacyId(event.id);
        return legacyId != null && idSet.has(legacyId);
      });
    }

    return isSearching ? [] : localFilteredEvents;
  }, [
    events,
    filterLegacyIds,
    isActive,
    isAiSearchActive,
    isSearching,
    localFilteredEvents,
    debouncedQuery,
    trimmedQuery,
    usedLocalFallback,
  ]);

  const clearSearch = useCallback(() => {
    requestSeqRef.current += 1;
    setQuery('');
    setDebouncedQuery('');
    setIsAiSearchActive(false);
    setKnowledgeCard(null);
    setParsedInsight(null);
    setFilterLegacyIds(null);
    setIsSearching(false);
    setUsedLocalFallback(false);
    lastFailToastQueryRef.current = '';
  }, []);

  return {
    query,
    setQuery,
    clearSearch,
    isActive,
    filteredEvents,
    localFilteredEvents,
    knowledgeCard,
    parsedInsight,
    isSearching: isAiSearchActive && isSearching,
    usedLocalFallback,
    isAiSearchActive,
  };
}
