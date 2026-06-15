import Taro, { useRouter } from '@tarojs/taro';
import { useCallback, useEffect, useMemo, useState } from 'react';
import { isLiveApi } from '../../../constants/api';
import {
  useItineraryMutations,
  useItineraryScheduleQuery,
} from '../../../hooks/useItineraryApi';
import { useItineraryStore } from '@/domains/performance-itinerary/store';
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

  const [stageFilter, setStageFilter] = useState('all');
  const [genreFilter, setGenreFilter] = useState('all');
  const [styleSearchQuery, setStyleSearchQuery] = useState('');
  const [sortMode, setSortMode] = useState<ExclusiveSortMode>('按人气排序');
  const [selectedIds, setSelectedIds] = useState<string[]>([]);
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
  const scheduleQuery = useItineraryScheduleQuery(apiEnabled ? activityLegacyId : null);
  const { generate } = useItineraryMutations(activityLegacyId ?? 0);
  const setFromGenerateResult = useItineraryStore((s) => s.setFromGenerateResult);

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
    setSelectedIds([]);
    setConflictDismissed(false);
    setStyleSearchQuery('');
    setGenreFilter('all');
    setStageFilter('all');
  }, [activityLegacyId]);

  useEffect(() => {
    const catalogIds = new Set(djCatalog.map((dj) => dj.id));
    setSelectedIds((prev) => {
      const next = prev.filter((id) => catalogIds.has(id));
      return next.length === prev.length ? prev : next;
    });
  }, [djCatalog]);

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

  return {
    activityLegacyId,
    navFallback,
    mainScrollHeight,
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
    refetchDjList: scheduleQuery.refetch,
  };
}
