import { useCallback, useMemo, useState } from 'react';
import { showAppToast } from '@/utils/appToast';
import { runTravelGuideGeneration } from '@/domains/travel-guide/runTravelGuideGeneration';
import { parseActivityDayCount } from '@/utils/parseActivityDayCount';
import { eventCityFromLocation } from '@/utils/travelGuideDepartureSuggestions';
import { requireAuth } from '@/utils/authGate';
import type { AiGuidePlanFormValues } from '@/types/travelGuide';

export type UseEventDetailTravelGuideOptions = {
  eventId: number;
  activityDate?: string;
  activityLocation?: string;
  /** Prefill sheet from navigation intent (e.g. regenerate from guide detail). */
  initialGuideForm?: AiGuidePlanFormValues | null;
  /** 重新生成时沿用原攻略 ID */
  regenerateGuideId?: string | null;
};

/** Travel-guide plan sheet on event detail — generation stays on detail / guide detail page. */
export function useEventDetailTravelGuide({
  eventId,
  activityDate,
  activityLocation,
  initialGuideForm = null,
  regenerateGuideId = null,
}: UseEventDetailTravelGuideOptions) {
  const [sheetOpen, setSheetOpen] = useState(false);
  const [sheetInitialValues, setSheetInitialValues] =
    useState<AiGuidePlanFormValues | null>(initialGuideForm);
  const [pendingRegenerateGuideId, setPendingRegenerateGuideId] = useState<
    string | null
  >(regenerateGuideId);

  const defaultNights = useMemo(
    () => parseActivityDayCount(activityDate),
    [activityDate],
  );

  const eventCity = useMemo(
    () => eventCityFromLocation(activityLocation),
    [activityLocation],
  );

  const openGuideSheet = useCallback(
    (prefill?: AiGuidePlanFormValues | null, guideId?: string | null) => {
      requireAuth(() => {
        if (!Number.isFinite(eventId) || eventId <= 0) {
          showAppToast('common.invalidActivity');
          return;
        }
        if (prefill) {
          setSheetInitialValues(prefill);
        }
        if (guideId?.trim()) {
          setPendingRegenerateGuideId(guideId.trim());
        }
        setSheetOpen(true);
      }, 'ai_assistant');
    },
    [eventId],
  );

  const closeGuideSheet = useCallback(() => {
    setSheetOpen(false);
    setPendingRegenerateGuideId(null);
  }, []);

  const handleGuideSheetSubmit = useCallback(
    (form: AiGuidePlanFormValues) => {
      const guideId = pendingRegenerateGuideId ?? undefined;
      setSheetOpen(false);
      setPendingRegenerateGuideId(null);
      void runTravelGuideGeneration(eventId, form, guideId);
    },
    [eventId, pendingRegenerateGuideId],
  );

  return {
    guideSheetOpen: sheetOpen,
    closeGuideSheet,
    openGuideSheet,
    handleGuideSheetSubmit,
    guideDefaultNights: defaultNights,
    guideEventCity: eventCity,
    guideSheetInitialValues: sheetInitialValues,
  };
}
