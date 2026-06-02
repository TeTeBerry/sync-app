import Taro, { useRouter } from '@tarojs/taro';
import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { isApiEnabled } from '../../../constants/api';
import { useActivityDetailQuery } from '../../../hooks/useSyncApi';
import {
  useItineraryMutations,
  useItineraryScheduleQuery,
  useSavedItineraryQuery,
} from '../../../hooks/useItineraryApi';
import { useItineraryStore } from '../../../stores/itineraryStore';
import { SUB_PAGE_HEADER_META_EXTRA_PX } from '../../../components/navigation/PageNavigation';
import { useStackPageMainHeight } from '../../../hooks/useTabPageMainHeight';
import {
  EXCLUSIVE_ITINERARY_DEFAULT_SELECTED_IDS,
  EXCLUSIVE_ITINERARY_DJS,
} from '../exclusive-itinerary/exclusiveItineraryMock';
import { resolveEventDetailIdFromQuery, ROUTES } from '../../../utils/route';
import { selectActiveActivityLegacyId, useNavigationStore } from '../../../stores';
import type {
  ItineraryDay as ApiItineraryDay,
  ItineraryDj,
} from '../../../types/backend';
import {
  buildItineraryBannerCopy,
  extractPerformanceArtistsFromDays,
  MY_ITINERARY_DAYS,
  MY_ITINERARY_EVENT_META,
  parseSelectedDjIds,
  resolveDjDisplayNames,
  type DjNameEntry,
  type ItineraryDay,
} from './myItineraryMock';
import { runSaveItineraryWallpaperFlow } from './generateItineraryWallpaper';
import { sanitizeItineraryDaysForSave } from './sanitizeItineraryForSave';
import { ApiError } from '../../../utils/apiClient';
import type { MyItineraryViewMode } from './components/MyItineraryToolbar';

const FOOTER_BASE_PX = 74;
const SEGMENT_TOGGLE_PX = 56;

function mapApiDjToNameEntry(dj: ItineraryDj): DjNameEntry {
  return { id: dj.id, name: dj.name };
}

export function useMyItineraryPage() {
  const router = useRouter();
  const activeActivityLegacyId = useNavigationStore(selectActiveActivityLegacyId);

  const activityLegacyId = useMemo(
    () => resolveEventDetailIdFromQuery(router.params, activeActivityLegacyId),
    [activeActivityLegacyId, router.params],
  );

  const [selectedDjIds, setSelectedDjIds] = useState<string[]>(() =>
    parseSelectedDjIds(router.params.selectedDjIds),
  );

  const apiEnabled = isApiEnabled();
  const consumePending = useItineraryStore((s) => s.consumePending);
  const activityQuery = useActivityDetailQuery(
    apiEnabled && Number.isFinite(activityLegacyId) ? activityLegacyId : undefined,
  );
  const scheduleQuery = useItineraryScheduleQuery(
    apiEnabled && Number.isFinite(activityLegacyId) ? activityLegacyId : null,
    { selectedDjIds },
  );
  const savedQuery = useSavedItineraryQuery(
    apiEnabled && Number.isFinite(activityLegacyId) ? activityLegacyId : null,
  );
  const { save } = useItineraryMutations(activityLegacyId ?? 0);
  const hydratedFromPendingRef = useRef(false);

  const [itineraryDays, setItineraryDays] = useState<ItineraryDay[]>(
    () => MY_ITINERARY_DAYS,
  );
  const [eventMeta, setEventMeta] = useState(MY_ITINERARY_EVENT_META);
  const [viewMode, setViewMode] = useState<MyItineraryViewMode>('timeline');
  const [activeDayId, setActiveDayId] = useState(() => itineraryDays[0]?.id ?? '');

  useEffect(() => {
    const fromQuery = parseSelectedDjIds(router.params.selectedDjIds);
    if (fromQuery.length > 0) {
      setSelectedDjIds(fromQuery);
    }
  }, [router.params.selectedDjIds]);

  useEffect(() => {
    hydratedFromPendingRef.current = false;
    if (!Number.isFinite(activityLegacyId) || activityLegacyId <= 0) return;

    const pending = consumePending(activityLegacyId);
    if (pending) {
      hydratedFromPendingRef.current = true;
      setItineraryDays(pending.days as ItineraryDay[]);
      setEventMeta(pending.eventMeta);
      if (pending.selectedDjIds.length > 0) {
        setSelectedDjIds(pending.selectedDjIds);
      }
      return;
    }

    if (!apiEnabled) {
      setItineraryDays(MY_ITINERARY_DAYS);
      setEventMeta(MY_ITINERARY_EVENT_META);
      setSelectedDjIds((prev) =>
        prev.length > 0 ? prev : [...EXCLUSIVE_ITINERARY_DEFAULT_SELECTED_IDS],
      );
    }
  }, [activityLegacyId, apiEnabled, consumePending]);

  useEffect(() => {
    if (!apiEnabled || hydratedFromPendingRef.current) return;
    if (!Number.isFinite(activityLegacyId) || activityLegacyId <= 0) return;
    if (savedQuery.isLoading) return;

    const saved = savedQuery.data;
    if (!saved?.saved || !saved.days?.length) return;

    setItineraryDays(saved.days as ItineraryDay[]);
    if (saved.eventMeta?.trim()) {
      setEventMeta(saved.eventMeta.trim());
    }
    if (saved.selectedDjIds?.length) {
      setSelectedDjIds(saved.selectedDjIds);
    }
  }, [activityLegacyId, apiEnabled, savedQuery.data, savedQuery.isLoading]);

  useEffect(() => {
    if (activityQuery.data?.name) {
      setEventMeta(activityQuery.data.name);
    }
  }, [activityQuery.data?.name]);

  const djCatalog = useMemo((): DjNameEntry[] => {
    if (apiEnabled && scheduleQuery.data?.djs?.length) {
      return scheduleQuery.data.djs.map(mapApiDjToNameEntry);
    }
    return EXCLUSIVE_ITINERARY_DJS.map((dj) => ({ id: dj.id, name: dj.name }));
  }, [apiEnabled, scheduleQuery.data?.djs]);

  const itineraryArtistNames = useMemo(
    () => extractPerformanceArtistsFromDays(itineraryDays),
    [itineraryDays],
  );

  const selectedDjNames = useMemo(
    () => resolveDjDisplayNames(selectedDjIds, djCatalog),
    [djCatalog, selectedDjIds],
  );

  const bannerCopy = useMemo(
    () =>
      buildItineraryBannerCopy({
        selectedDjIds,
        selectedDjNames,
        itineraryArtistNames,
        eventMeta,
        dayLabels: itineraryDays.map((day) => day.bannerDateLabel),
      }),
    [eventMeta, itineraryArtistNames, itineraryDays, selectedDjIds, selectedDjNames],
  );

  useEffect(() => {
    if (!itineraryDays.some((d) => d.id === activeDayId)) {
      setActiveDayId(itineraryDays[0]?.id ?? '');
    }
  }, [activeDayId, itineraryDays]);

  const footerChromePx = useMemo(() => {
    try {
      const win = Taro.getWindowInfo();
      const screenHeight = win.screenHeight ?? win.windowHeight ?? 667;
      const safeBottom =
        win.safeArea != null ? Math.max(0, screenHeight - win.safeArea.bottom) : 0;
      return FOOTER_BASE_PX + safeBottom;
    } catch {
      return FOOTER_BASE_PX;
    }
  }, []);

  const mainScrollHeight = useStackPageMainHeight(
    footerChromePx + SEGMENT_TOGGLE_PX + SUB_PAGE_HEADER_META_EXTRA_PX,
  );

  const handleShare = useCallback(() => {
    void Taro.showToast({ title: '分享功能即将上线', icon: 'none' });
  }, []);

  const handleReselect = useCallback(() => {
    void Taro.navigateBack();
  }, []);

  const handleSave = useCallback(async () => {
    const daysForSave = sanitizeItineraryDaysForSave(
      itineraryDays as ApiItineraryDay[],
    );

    let serverSaved = false;
    if (apiEnabled && Number.isFinite(activityLegacyId) && activityLegacyId > 0) {
      try {
        await save({
          eventMeta: eventMeta.trim().slice(0, 200),
          days: daysForSave,
          selectedDjIds,
        });
        void savedQuery.refetch();
        serverSaved = true;
      } catch (error) {
        const message =
          error instanceof ApiError
            ? error.message
            : error instanceof Error
              ? error.message
              : '保存失败，请重试';
        void Taro.showToast({ title: message, icon: 'none' });
        return;
      }
    }

    void runSaveItineraryWallpaperFlow(
      {
        eventMeta,
        days: daysForSave.map((day) => ({
          dateKey: day.id,
          dateLabel: day.bannerDateLabel,
          items: day.items,
        })),
      },
      { serverSaved },
    );
  }, [
    activityLegacyId,
    apiEnabled,
    eventMeta,
    itineraryDays,
    save,
    savedQuery,
    selectedDjIds,
  ]);

  const navFallback =
    Number.isFinite(activityLegacyId) && activityLegacyId > 0
      ? ROUTES.EXCLUSIVE_ITINERARY
      : ROUTES.EVENTS;

  return {
    eventMeta,
    bannerCopy,
    itineraryDays,
    viewMode,
    setViewMode,
    activeDayId,
    setActiveDayId,
    mainScrollHeight,
    handleShare,
    handleReselect,
    handleSave,
    navFallback,
  };
}
