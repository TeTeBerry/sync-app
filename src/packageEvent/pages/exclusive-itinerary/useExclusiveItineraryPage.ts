import Taro, { useRouter } from '@tarojs/taro';
import { useCallback, useEffect, useMemo, useState } from 'react';
import { isLiveApi } from '../../../constants/api';
import {
  useItineraryMutations,
  useItineraryScheduleQuery,
  useSavedItineraryQuery,
} from '../../../hooks/useItineraryApi';
import { useActivityDetailQuery } from '../../../hooks/sync/activities';
import { useItineraryStore } from '@/domains/performance-itinerary/store';
import { normalizeItineraryDaysForSave } from '@/types/itinerary';
import { useStackPageMainHeight } from '../../../hooks/useTabPageMainHeight';
import {
  goMyItinerary,
  resolveEventDetailIdFromQuery,
  ROUTES,
} from '../../../utils/route';
import { selectActiveActivityLegacyId, useNavigationStore } from '../../../stores';
import {
  buildGenreFilterOptions,
  buildStageFilterOptions,
  djMatchesStyleFilter,
  djMatchesStyleSearch,
  filterGenreOptionsBySearch,
  isValidFilterId,
} from './exclusiveItineraryFilters';
import { mapItineraryDjFromApi } from '@/domains/performance-itinerary/utils/mapItineraryDj';
import {
  itineraryDjCardDomId,
  resolveItineraryDjSelection,
} from '@/domains/performance-itinerary/utils/resolveItineraryDjSelection';
import { readExclusiveItineraryRouteSelection } from './readExclusiveItineraryRouteSelection';
import type { ExclusiveItineraryDj } from './types';
import { detectItineraryConflicts } from './itineraryConflict.util';
import type { ItineraryConflict } from '../../../types/backend';

const CTA_FOOTER_BASE_PX = 74;
const SORT_OPTIONS = ['按人气排序', '按名字排序'] as const;
export type ExclusiveSortMode = (typeof SORT_OPTIONS)[number];

function djMatchesStage(dj: ExclusiveItineraryDj, stageId: string): boolean {
  if (stageId === 'all') {
    return true;
  }
  return dj.stage === stageId;
}

export function useExclusiveItineraryPage() {
  const router = useRouter();
  const activeActivityLegacyId = useNavigationStore(selectActiveActivityLegacyId);

  const activityLegacyId = useMemo(
    () => resolveEventDetailIdFromQuery(router.params, activeActivityLegacyId),
    [activeActivityLegacyId, router.params],
  );

  const routeSelection = useState(() =>
    readExclusiveItineraryRouteSelection(router.params, activeActivityLegacyId),
  )[0];

  const [stageFilter, setStageFilter] = useState('all');
  const [genreFilter, setGenreFilter] = useState('all');
  const [styleSearchQuery, setStyleSearchQuery] = useState('');
  const [sortMode, setSortMode] = useState<ExclusiveSortMode>('按人气排序');
  const [selectedIds, setSelectedIds] = useState<string[]>(
    () => routeSelection.selectedDjIds,
  );
  const [focusDjId, setFocusDjId] = useState<string | undefined>();
  const [scrollIntoViewId, setScrollIntoViewId] = useState('');
  const [infoOpen, setInfoOpen] = useState(false);
  const [sortSheetOpen, setSortSheetOpen] = useState(false);
  const [hintModal, setHintModal] = useState<{
    title: string;
    message: string;
    confirmText?: string;
    secondaryCta?: { label: string; onClick: () => void };
    showIcon?: boolean;
  } | null>(null);
  const [conflictDismissed, setConflictDismissed] = useState(false);
  const [generating, setGenerating] = useState(false);

  const apiEnabled = isLiveApi();
  const forceReselect = router.params.reselect === '1';
  const hasPreselection =
    routeSelection.selectedDjIds.length > 0 ||
    routeSelection.selectedDjNames.length > 0 ||
    routeSelection.focusDjName.length > 0;
  const scheduleQuery = useItineraryScheduleQuery(apiEnabled ? activityLegacyId : null);
  const activityQuery = useActivityDetailQuery(
    apiEnabled && Number.isFinite(activityLegacyId) && activityLegacyId > 0
      ? activityLegacyId
      : undefined,
  );
  const savedQuery = useSavedItineraryQuery(apiEnabled ? activityLegacyId : null);
  const { generate, save } = useItineraryMutations(activityLegacyId ?? 0);
  const setFromGenerateResult = useItineraryStore((s) => s.setFromGenerateResult);

  const shouldCheckSavedRedirect =
    apiEnabled &&
    !forceReselect &&
    !hasPreselection &&
    Number.isFinite(activityLegacyId) &&
    activityLegacyId > 0;

  const skipDjSelectionPending = shouldCheckSavedRedirect && savedQuery.isLoading;

  useEffect(() => {
    if (!shouldCheckSavedRedirect) return;
    if (savedQuery.isLoading) return;

    const saved = savedQuery.data;
    if (!saved?.saved || !saved.days?.length) return;

    goMyItinerary(activityLegacyId, saved.selectedDjIds, { replace: true });
  }, [
    activityLegacyId,
    savedQuery.data,
    savedQuery.isLoading,
    shouldCheckSavedRedirect,
  ]);

  const djCatalog = useMemo(
    (): ExclusiveItineraryDj[] =>
      (scheduleQuery.data?.djs ?? []).map(mapItineraryDjFromApi),
    [scheduleQuery.data?.djs],
  );

  const djListLoading = scheduleQuery.isLoading && djCatalog.length === 0;
  const djListError =
    scheduleQuery.isError && !scheduleQuery.isLoading && djCatalog.length === 0;

  const stageOptions = useMemo(() => buildStageFilterOptions(djCatalog), [djCatalog]);

  const genreOptions = useMemo(() => {
    const base = buildGenreFilterOptions(djCatalog);
    return filterGenreOptionsBySearch(base, styleSearchQuery);
  }, [djCatalog, styleSearchQuery]);

  useEffect(() => {
    setConflictDismissed(false);
    setStyleSearchQuery('');
    setGenreFilter('all');
    setStageFilter('all');
    setSelectedIds([]);
    setFocusDjId(undefined);
    setScrollIntoViewId('');
  }, [activityLegacyId, routeSelection]);

  useEffect(() => {
    if (!djCatalog.length) return;

    const resolved = resolveItineraryDjSelection({
      requestedIds: routeSelection.selectedDjIds,
      selectedDjNames: routeSelection.selectedDjNames,
      focusDjName: routeSelection.focusDjName || undefined,
      catalog: djCatalog,
    });

    if (routeSelection.focusDjName || routeSelection.selectedDjNames.length > 0) {
      setStageFilter('all');
      setGenreFilter('all');
      setStyleSearchQuery('');
    }

    setSelectedIds(resolved.selectedIds);
    setFocusDjId(resolved.focusDjId);
  }, [djCatalog, routeSelection]);

  useEffect(() => {
    if (!isValidFilterId(stageOptions, stageFilter)) {
      setStageFilter('all');
    }
  }, [stageFilter, stageOptions]);

  useEffect(() => {
    if (!isValidFilterId(genreOptions, genreFilter)) {
      setGenreFilter('all');
    }
  }, [genreFilter, genreOptions]);

  const conflicts: ItineraryConflict[] = useMemo(() => {
    return detectItineraryConflicts(
      scheduleQuery.data?.performances ?? [],
      selectedIds,
    );
  }, [scheduleQuery.data?.performances, selectedIds]);

  const footerChromePx = useMemo(() => {
    try {
      const win = Taro.getWindowInfo();
      const screenHeight = win.screenHeight ?? win.windowHeight ?? 667;
      const safeBottom =
        win.safeArea != null ? Math.max(0, screenHeight - win.safeArea.bottom) : 0;
      return CTA_FOOTER_BASE_PX + safeBottom;
    } catch {
      return CTA_FOOTER_BASE_PX;
    }
  }, []);

  const mainScrollHeight = useStackPageMainHeight(footerChromePx);

  const filteredDjs = useMemo(() => {
    const list = djCatalog.filter(
      (dj) =>
        djMatchesStage(dj, stageFilter) &&
        djMatchesStyleFilter(dj, genreFilter) &&
        djMatchesStyleSearch(dj, styleSearchQuery),
    );
    const sorted = [...list];
    if (sortMode === '按名字排序') {
      sorted.sort((a, b) => a.name.localeCompare(b.name, 'zh'));
    } else {
      sorted.sort((a, b) => b.popularity - a.popularity);
    }
    return sorted;
  }, [djCatalog, genreFilter, sortMode, stageFilter, styleSearchQuery]);

  useEffect(() => {
    if (!focusDjId) return;
    if (!filteredDjs.some((dj) => dj.id === focusDjId)) return;

    const targetId = itineraryDjCardDomId(focusDjId);
    const scrollTimer = setTimeout(() => {
      setScrollIntoViewId(targetId);
    }, 300);
    const clearTimer = setTimeout(() => {
      setScrollIntoViewId('');
    }, 1500);

    return () => {
      clearTimeout(scrollTimer);
      clearTimeout(clearTimer);
    };
  }, [focusDjId, filteredDjs]);

  const toggleDj = useCallback((id: string) => {
    setConflictDismissed(false);
    setSelectedIds((prev) => {
      if (prev.includes(id)) {
        return prev.filter((item) => item !== id);
      }
      return [...prev, id];
    });
  }, []);

  const openSortSheet = useCallback(() => {
    setSortSheetOpen(true);
  }, []);

  const closeSortSheet = useCallback(() => {
    setSortSheetOpen(false);
  }, []);

  const openInfo = useCallback(() => {
    setInfoOpen(true);
  }, []);

  const closeModal = useCallback(() => {
    const wasBuddyHint = hintModal?.secondaryCta != null;
    setInfoOpen(false);
    setHintModal(null);
    if (wasBuddyHint && Number.isFinite(activityLegacyId) && activityLegacyId > 0) {
      goMyItinerary(activityLegacyId, selectedIds);
    }
  }, [activityLegacyId, hintModal?.secondaryCta, selectedIds]);

  const handleGenerate = useCallback(async () => {
    if (selectedIds.length === 0) {
      setHintModal({
        title: '请先选择 DJ',
        message: '勾选至少一位 DJ 后，即可生成你的专属观演行程。',
      });
      return;
    }
    if (scheduleQuery.data?.schedulePublished === false) {
      setHintModal({
        title: '时间表尚未发布',
        message: '官方演出时间表尚未公布，请耐心等待。当前可先浏览阵容并预选 DJ。',
      });
      return;
    }
    if (!Number.isFinite(activityLegacyId) || activityLegacyId <= 0) {
      goMyItinerary(activityLegacyId, selectedIds);
      return;
    }

    setGenerating(true);
    try {
      const result = await generate({ selectedDjIds: selectedIds });
      setFromGenerateResult(activityLegacyId, selectedIds, result);
      void save({
        eventMeta: result.itinerary.eventMeta.trim().slice(0, 200),
        days: normalizeItineraryDaysForSave(result.itinerary.days),
        selectedDjIds: selectedIds,
      }).catch(() => undefined);
      goMyItinerary(activityLegacyId, selectedIds);
    } catch (error) {
      const message =
        error instanceof Error ? error.message : '行程生成失败，请稍后重试';
      void Taro.showToast({ title: message, icon: 'none' });
    } finally {
      setGenerating(false);
    }
  }, [
    activityLegacyId,
    generate,
    save,
    scheduleQuery.data?.schedulePublished,
    selectedIds,
    setFromGenerateResult,
  ]);

  const sortSheetItems = useMemo(
    () =>
      SORT_OPTIONS.map((option) => ({
        label: option,
        active: sortMode === option,
        onSelect: () => {
          setSortMode(option);
          setSortSheetOpen(false);
        },
      })),
    [sortMode],
  );

  const navFallback =
    Number.isFinite(activityLegacyId) && activityLegacyId > 0
      ? ROUTES.EVENT_DETAIL
      : ROUTES.EVENTS;

  const showConflictBanner = !conflictDismissed && conflicts.length > 0;

  const lineupPending = activityQuery.data?.lineupPublished === false;
  const activityTitle = activityQuery.data?.name ?? '';

  return {
    activityLegacyId,
    activityTitle,
    navFallback,
    mainScrollHeight,
    lineupPending,
    conflicts,
    showConflictBanner,
    onDismissConflicts: () => setConflictDismissed(true),
    stageFilter,
    genreFilter,
    styleSearchQuery,
    stageOptions,
    genreOptions,
    sortMode,
    selectedIds,
    filteredDjs,
    setStageFilter,
    setGenreFilter,
    setStyleSearchQuery,
    toggleDj,
    openSortSheet,
    closeSortSheet,
    openInfo,
    closeModal,
    handleGenerate,
    sortSheetItems,
    sortSheetOpen,
    infoOpen,
    hintModal,
    generating,
    djListLoading,
    djListError,
    skipDjSelectionPending,
    refetchDjList: scheduleQuery.refetch,
    scrollIntoViewId,
  };
}
