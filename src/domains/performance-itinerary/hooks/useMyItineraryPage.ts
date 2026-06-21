import Taro, { useRouter } from '@tarojs/taro';
import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { isLiveApi } from '@/constants/api';
import { useActivityDetailQuery } from '@/hooks/useSyncApi';
import {
  useItineraryMutations,
  useItineraryScheduleQuery,
  useSavedItineraryQuery,
} from '@/hooks/useItineraryApi';
import { useItineraryStore } from '@/domains/performance-itinerary/store';
import { stackPageNavChromePx } from '@/components/navigation/PageNavigation';
import { useNavBarInsets } from '@/hooks/useNavBarInsets';
import { useTabPageMainHeight } from '@/hooks/useTabPageMainHeight';
import {
  resolveEventDetailIdFromQuery,
  ROUTES,
  goExclusiveItinerary,
} from '@/utils/route';
import { selectActiveActivityLegacyId, useNavigationStore } from '@/stores';
import type { ItineraryDay as ApiItineraryDay, ItineraryDj } from '@/types/backend';
import type { ItineraryDay } from '../types/myItineraryUi';
import {
  buildItineraryBannerCopy,
  extractPerformanceArtistsFromDays,
  parseSelectedDjIds,
  resolveDjDisplayNames,
  type DjNameEntry,
} from '../utils/itineraryBanner';
import { runSaveItineraryWallpaperFlow } from '../utils/generateItineraryWallpaper';
import { normalizeItineraryDaysForSave } from '@/types/itinerary';
import { useT } from '@/hooks/useI18n';
import { ApiError } from '@/utils/apiClient';
import type { MyItineraryViewMode } from '../components/MyItineraryToolbar';

/** 8px pad + 48px btn + 8px pad — matches .s-my-itinerary__footer */
const FOOTER_BASE_PX = 64;
const SEGMENT_TOGGLE_PX = 56;

function mapApiDjToNameEntry(dj: ItineraryDj): DjNameEntry {
  return { id: dj.id, name: dj.name };
}

export function useMyItineraryPage() {
  const router = useRouter();
  const navInsets = useNavBarInsets();
  const activeActivityLegacyId = useNavigationStore(selectActiveActivityLegacyId);

  const activityLegacyId = useMemo(
    () => resolveEventDetailIdFromQuery(router.params, activeActivityLegacyId),
    [activeActivityLegacyId, router.params],
  );

  const [selectedDjIds, setSelectedDjIds] = useState<string[]>(() =>
    parseSelectedDjIds(router.params.selectedDjIds),
  );

  const apiEnabled = isLiveApi();
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
  const initialPerformanceIntent =
    parseSelectedDjIds(router.params.selectedDjIds).length > 0;

  const [pageKind, setPageKind] = useState<'travel' | 'performance'>(() =>
    initialPerformanceIntent ? 'performance' : 'travel',
  );
  const [pageKindResolved, setPageKindResolved] = useState(
    () => initialPerformanceIntent || !apiEnabled,
  );

  const [itineraryDays, setItineraryDays] = useState<ItineraryDay[]>([]);
  const [eventMeta, setEventMeta] = useState('');
  const [viewMode, setViewMode] = useState<MyItineraryViewMode>('timeline');
  const [activeDayId, setActiveDayId] = useState(() => itineraryDays[0]?.id ?? '');
  const t = useT();
  useEffect(() => {
    const fromQuery = parseSelectedDjIds(router.params.selectedDjIds);
    if (fromQuery.length > 0) {
      setSelectedDjIds(fromQuery);
    }
  }, [router.params.selectedDjIds]);

  useEffect(() => {
    hydratedFromPendingRef.current = false;
    if (!initialPerformanceIntent && apiEnabled) {
      setPageKindResolved(false);
    }
    if (!Number.isFinite(activityLegacyId) || activityLegacyId <= 0) return;

    const pending = consumePending(activityLegacyId);
    if (pending) {
      hydratedFromPendingRef.current = true;
      setPageKind('performance');
      setPageKindResolved(true);
      if (pending.days.length > 0) {
        setItineraryDays(pending.days as ItineraryDay[]);
      } else {
        void Taro.showToast({
          title: t('itinerary.noPerformanceSchedule'),
          icon: 'none',
        });
      }
      setEventMeta(pending.eventMeta);
      if (pending.selectedDjIds.length > 0) {
        setSelectedDjIds(pending.selectedDjIds);
      }
      return;
    }
  }, [activityLegacyId, apiEnabled, consumePending, initialPerformanceIntent, t]);

  useEffect(() => {
    if (!apiEnabled || hydratedFromPendingRef.current) return;
    if (!Number.isFinite(activityLegacyId) || activityLegacyId <= 0) {
      setPageKindResolved(true);
      return;
    }
    if (savedQuery.isLoading) return;

    setPageKindResolved(true);

    const saved = savedQuery.data;
    if (!saved?.saved || !saved.days?.length) return;

    setPageKind('performance');
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

  const djCatalog = useMemo(
    (): DjNameEntry[] => (scheduleQuery.data?.djs ?? []).map(mapApiDjToNameEntry),
    [scheduleQuery.data?.djs],
  );

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

  const footerChromePx = FOOTER_BASE_PX;

  const headerChromePx = stackPageNavChromePx(navInsets, { meta: true });
  const travelScrollHeight = useTabPageMainHeight(headerChromePx);
  const performanceScrollHeight = useTabPageMainHeight(
    headerChromePx + SEGMENT_TOGGLE_PX + footerChromePx,
  );
  const mainScrollHeight =
    pageKind === 'travel' ? travelScrollHeight : performanceScrollHeight;

  const handleShare = useCallback(() => {
    void Taro.showToast({ title: t('itinerary.shareComingSoon'), icon: 'none' });
  }, []);

  const handleReselect = useCallback(() => {
    if (Number.isFinite(activityLegacyId) && activityLegacyId > 0) {
      goExclusiveItinerary(activityLegacyId, undefined, { reselect: true });
      return;
    }
    void Taro.navigateBack();
  }, [activityLegacyId]);

  const handleSave = useCallback(async () => {
    void Taro.showLoading({ title: t('itinerary.generatingWallpaper'), mask: true });

    const daysForSave = normalizeItineraryDaysForSave(
      itineraryDays as ApiItineraryDay[],
    );

    let serverSaved = false;
    try {
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
                : t('itinerary.saveFailed');
          void Taro.showToast({ title: message, icon: 'none' });
          return;
        }
      }

      await runSaveItineraryWallpaperFlow(
        {
          eventMeta,
          title: t('itinerary.wallpaperTitle'),
          days: daysForSave.map((day) => ({
            dateKey: day.id,
            dateLabel: day.bannerDateLabel,
            items: day.items,
          })),
        },
        { serverSaved, manageLoading: false },
      );
    } finally {
      void Taro.hideLoading();
    }
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
      ? pageKind === 'travel'
        ? ROUTES.EVENT_DETAIL
        : ROUTES.EXCLUSIVE_ITINERARY
      : ROUTES.EVENTS;

  return {
    pageKind,
    pageKindResolved,
    activityLegacyId,
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
