import Taro, { useRouter } from '@tarojs/taro';
import { useCallback, useEffect, useMemo, useState } from 'react';
import { isLiveApi } from '../../../constants/api';
import {
  useItineraryMutations,
  useItineraryScheduleQuery,
  useSavedItineraryQuery,
} from '../../../hooks/useItineraryApi';
import { useActivityDetailQuery } from '../../../hooks/sync/activities';
import { useActivityPerformanceBundleOffline } from '@/hooks/useActivityPerformanceBundleOffline';
import { useActivityPerformanceBundleWriter } from '@/hooks/useActivityPerformanceBundleWriter';
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
import type { LineupArtistSortMode } from '../activity-lineup/utils/sortLineupArtists';
import { useT } from '@/hooks/useI18n';

const CTA_FOOTER_BASE_PX = 74;
const SORT_MODES: LineupArtistSortMode[] = ['popularity', 'name'];
export type ExclusiveSortMode = LineupArtistSortMode;

function djMatchesStage(dj: ExclusiveItineraryDj, stageId: string): boolean {
  if (stageId === 'all') {
    return true;
  }
  return dj.stage === stageId;
}

export function useExclusiveItineraryPage() {
  const t = useT();
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
  const [sortMode, setSortMode] = useState<ExclusiveSortMode>('popularity');
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
  const queryFailed =
    scheduleQuery.isError || activityQuery.isError || savedQuery.isError;
  const offline = useActivityPerformanceBundleOffline(activityLegacyId, {
    queryFailed,
  });
  const scheduleData = scheduleQuery.data ?? offline.bundle?.schedule;

  useActivityPerformanceBundleWriter(
    apiEnabled && Number.isFinite(activityLegacyId) && activityLegacyId > 0
      ? activityLegacyId
      : undefined,
    {
      activity: activityQuery.data,
      schedule: scheduleQuery.data,
      savedItinerary: savedQuery.data,
    },
  );

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
    (): ExclusiveItineraryDj[] => (scheduleData?.djs ?? []).map(mapItineraryDjFromApi),
    [scheduleData?.djs],
  );

  const djListLoading =
    scheduleQuery.isLoading && djCatalog.length === 0 && !offline.isOfflineBundle;
  const djListError =
    scheduleQuery.isError &&
    !scheduleQuery.isLoading &&
    djCatalog.length === 0 &&
    !offline.isOfflineBundle;

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
    return detectItineraryConflicts(scheduleData?.performances ?? [], selectedIds);
  }, [scheduleData?.performances, selectedIds]);

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
    if (sortMode === 'name') {
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
        title: t('itinerary.selectDjFirstTitle'),
        message: t('itinerary.selectDjFirstMessage'),
      });
      return;
    }
    if (scheduleQuery.data?.schedulePublished === false) {
      setHintModal({
        title: t('itinerary.scheduleUnpublishedModalTitle'),
        message: t('itinerary.scheduleUnpublishedModalMessage'),
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
        error instanceof Error ? error.message : t('itinerary.generateFailed');
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
    t,
  ]);

  const sortSheetItems = useMemo(
    () =>
      SORT_MODES.map((mode) => ({
        label:
          mode === 'name'
            ? t('activityLineup.sortByName')
            : t('activityLineup.sortByPopularity'),
        active: sortMode === mode,
        onSelect: () => {
          setSortMode(mode);
          setSortSheetOpen(false);
        },
      })),
    [sortMode, t],
  );

  const navFallback =
    Number.isFinite(activityLegacyId) && activityLegacyId > 0
      ? ROUTES.EVENT_DETAIL
      : ROUTES.EVENTS;

  const showConflictBanner = !conflictDismissed && conflicts.length > 0;

  const lineupPending =
    (activityQuery.data ?? offline.bundle?.activity)?.lineupPublished === false;
  const activityTitle =
    activityQuery.data?.name ?? offline.bundle?.activity?.name ?? '';

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
    isOfflineBundle: offline.isOfflineBundle,
    bundleSavedAt: offline.bundleSavedAt,
  };
}
