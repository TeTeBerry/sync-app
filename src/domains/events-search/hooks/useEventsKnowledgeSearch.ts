import Taro from '@tarojs/taro';
import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { runScene } from '@/api/sync/sceneRun';
import { isLiveApi } from '@/constants/api';
import { applySceneEffects } from '@/domains/scene-agent/applySceneEffects';
import { useLocale, useT } from '@/hooks/useI18n';
import type { KnowledgeCardPayload } from '@sync/scene-contracts';
import { ApiError, isApiAbortError } from '@/utils/apiClient';
import { resolveEventCardLegacyId } from '@/utils/apiMappers';
import type { EventCardUi } from '@/utils/apiMappers';

const SEARCH_DEBOUNCE_MS = 600;
const SEARCH_FAIL_TOAST = 'AI 资讯暂时不可用，请用关键词筛选或稍后再试';

export type EventsSearchMode = 'keyword' | 'knowledge';

function isSearchRateLimited(error: unknown): boolean {
  return (
    error instanceof ApiError &&
    (error.status === 429 ||
      error.message.includes('频繁') ||
      error.message.includes('rate limit'))
  );
}

export function useEventsKnowledgeSearch(events: EventCardUi[]) {
  const locale = useLocale();
  const t = useT();
  const [mode, setMode] = useState<EventsSearchMode>('keyword');
  const [query, setQuery] = useState('');
  const [debouncedQuery, setDebouncedQuery] = useState('');
  const [knowledgeCard, setKnowledgeCard] = useState<KnowledgeCardPayload | null>(null);
  const [parsedInsight, setParsedInsight] = useState<string | null>(null);
  const [filterLegacyIds, setFilterLegacyIds] = useState<number[] | null>(null);
  const [isSearching, setIsSearching] = useState(false);
  const [usedLocalFallback, setUsedLocalFallback] = useState(false);
  const requestSeqRef = useRef(0);
  const lastFailToastQueryRef = useRef('');

  const useRemoteSearch = isLiveApi() && mode === 'knowledge';

  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedQuery(query.trim());
    }, SEARCH_DEBOUNCE_MS);
    return () => clearTimeout(timer);
  }, [query]);

  useEffect(() => {
    if (!debouncedQuery || !useRemoteSearch) {
      setKnowledgeCard(null);
      setParsedInsight(null);
      setFilterLegacyIds(null);
      setIsSearching(false);
      setUsedLocalFallback(false);
      return;
    }

    const controller = new AbortController();
    const requestSeq = ++requestSeqRef.current;
    setIsSearching(true);
    setUsedLocalFallback(false);
    setKnowledgeCard(null);
    setParsedInsight(null);
    setFilterLegacyIds(null);

    void runScene(
      {
        scene: 'events_knowledge_search',
        intent: 'search',
        input: debouncedQuery,
        context: {
          trigger: 'search',
          locale,
        },
      },
      { signal: controller.signal },
    )
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

        const localMatches = events.filter((event) => {
          const haystack = [
            event.title,
            event.location,
            event.area,
            event.category,
            ...(event.alias ?? []),
          ]
            .filter(Boolean)
            .join(' ')
            .toLowerCase();
          return haystack.includes(debouncedQuery.toLowerCase());
        });

        setKnowledgeCard({
          title: t('events.knowledge.fallbackTitle'),
          sections: [
            {
              body:
                localMatches.length > 0
                  ? t('events.knowledge.offlineMatched', {
                      count: localMatches.length,
                    })
                  : t('events.knowledge.offlineFallback'),
            },
          ],
          sources: [t('events.knowledge.fallbackSource')],
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
          debouncedQuery !== lastFailToastQueryRef.current &&
          !isSearchRateLimited(error)
        ) {
          lastFailToastQueryRef.current = debouncedQuery;
          Taro.showToast({ title: SEARCH_FAIL_TOAST, icon: 'none' });
        }
      })
      .finally(() => {
        if (requestSeq === requestSeqRef.current) {
          setIsSearching(false);
        }
      });

    return () => controller.abort();
  }, [debouncedQuery, events, locale, t, useRemoteSearch]);

  const filteredEvents = useMemo(() => {
    if (mode !== 'knowledge' || !query.trim()) {
      return null;
    }
    if (!filterLegacyIds?.length) {
      return usedLocalFallback ? null : [];
    }
    const idSet = new Set(filterLegacyIds);
    return events.filter((event) => {
      const legacyId = resolveEventCardLegacyId(event.id);
      return legacyId != null && idSet.has(legacyId);
    });
  }, [events, filterLegacyIds, mode, query, usedLocalFallback]);

  const setModeAndReset = useCallback((nextMode: EventsSearchMode) => {
    setMode(nextMode);
    if (nextMode === 'keyword') {
      setKnowledgeCard(null);
      setParsedInsight(null);
      setFilterLegacyIds(null);
      setUsedLocalFallback(false);
      setIsSearching(false);
    }
  }, []);

  return {
    mode,
    setMode: setModeAndReset,
    query,
    setQuery,
    knowledgeCard,
    parsedInsight,
    filteredEvents,
    isSearching,
    usedLocalFallback,
    useRemoteSearch,
  };
}
