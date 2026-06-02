import Taro, { useRouter } from '@tarojs/taro';
import { useCallback, useMemo, useState } from 'react';
import { isApiEnabled } from '../../../constants/api';
import {
  useItineraryMutations,
  useItineraryScheduleQuery,
} from '../../../hooks/useItineraryApi';
import { useItineraryStore } from '../../../stores/itineraryStore';
import { useStackPageMainHeight } from '../../../hooks/useTabPageMainHeight';
import {
  goMyItinerary,
  resolveEventDetailIdFromQuery,
  ROUTES,
} from '../../../utils/route';
import { selectActiveActivityLegacyId, useNavigationStore } from '../../../stores';
import {
  EXCLUSIVE_ITINERARY_DEFAULT_SELECTED_IDS,
  EXCLUSIVE_ITINERARY_DJS,
  EXCLUSIVE_ITINERARY_MOCK_CONFLICT_SLOTS,
  type ExclusiveItineraryDj,
} from './exclusiveItineraryMock';
import { detectItineraryConflicts } from './itineraryConflict.util';
import type { ItineraryConflict, ItineraryDj } from '../../../types/backend';

const CTA_FOOTER_BASE_PX = 74;
const SORT_OPTIONS = ['按人气排序', '按名字排序'] as const;
export type ExclusiveSortMode = (typeof SORT_OPTIONS)[number];

function djMatchesGenre(dj: ExclusiveItineraryDj, genreId: string): boolean {
  if (genreId === 'all') {
    return true;
  }
  if (dj.genre === genreId) {
    return true;
  }
  return dj.genreLabel.toLowerCase().includes(genreId.toLowerCase());
}

function djMatchesStage(dj: ExclusiveItineraryDj, stageId: string): boolean {
  if (stageId === 'all') {
    return true;
  }
  return dj.stage === stageId;
}

function mapApiDj(dj: ItineraryDj): ExclusiveItineraryDj {
  const stage = dj.stage as ExclusiveItineraryDj['stage'];
  return {
    id: dj.id,
    name: dj.name,
    genre: dj.genre,
    genreLabel: dj.genreLabel,
    stage:
      stage === 'main' || stage === 'bass' || stage === 'late' || stage === 'outdoor'
        ? stage
        : 'main',
    popularity: dj.popularity,
    avatarSeed: dj.avatarSeed,
    genreColor: dj.genreColor,
  };
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
  const [sortMode, setSortMode] = useState<ExclusiveSortMode>('按人气排序');
  const [selectedIds, setSelectedIds] = useState<string[]>(() => [
    ...EXCLUSIVE_ITINERARY_DEFAULT_SELECTED_IDS,
  ]);
  const [infoOpen, setInfoOpen] = useState(false);
  const [sortSheetOpen, setSortSheetOpen] = useState(false);
  const [hintModal, setHintModal] = useState<{
    title: string;
    message: string;
  } | null>(null);
  const [conflictDismissed, setConflictDismissed] = useState(false);
  const [generating, setGenerating] = useState(false);

  const apiEnabled = isApiEnabled();
  const scheduleQuery = useItineraryScheduleQuery(apiEnabled ? activityLegacyId : null);
  const { generate } = useItineraryMutations(activityLegacyId ?? 0);
  const setFromGenerateResult = useItineraryStore((s) => s.setFromGenerateResult);

  const djCatalog = useMemo(() => {
    if (apiEnabled && scheduleQuery.data?.djs?.length) {
      return scheduleQuery.data.djs.map(mapApiDj);
    }
    return EXCLUSIVE_ITINERARY_DJS;
  }, [apiEnabled, scheduleQuery.data?.djs]);

  const conflicts: ItineraryConflict[] = useMemo(() => {
    const slots =
      apiEnabled && scheduleQuery.data?.performances?.length
        ? scheduleQuery.data.performances
        : EXCLUSIVE_ITINERARY_MOCK_CONFLICT_SLOTS;
    return detectItineraryConflicts(slots, selectedIds);
  }, [apiEnabled, scheduleQuery.data?.performances, selectedIds]);

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
      (dj) => djMatchesStage(dj, stageFilter) && djMatchesGenre(dj, genreFilter),
    );
    const sorted = [...list];
    if (sortMode === '按名字排序') {
      sorted.sort((a, b) => a.name.localeCompare(b.name, 'zh'));
    } else {
      sorted.sort((a, b) => b.popularity - a.popularity);
    }
    return sorted;
  }, [djCatalog, genreFilter, sortMode, stageFilter]);

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
    setInfoOpen(false);
    setHintModal(null);
  }, []);

  const handleGenerate = useCallback(async () => {
    if (selectedIds.length === 0) {
      setHintModal({
        title: '请先选择 DJ',
        message: '勾选至少一位 DJ 后，即可生成你的专属观演行程。',
      });
      return;
    }
    if (!Number.isFinite(activityLegacyId) || activityLegacyId <= 0) {
      goMyItinerary(activityLegacyId, selectedIds);
      return;
    }

    if (!apiEnabled) {
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
  }, [activityLegacyId, apiEnabled, generate, selectedIds, setFromGenerateResult]);

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
    sortMode,
    selectedIds,
    filteredDjs,
    setStageFilter,
    setGenreFilter,
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
  };
}
