import { useCallback, useMemo, useState } from 'react';
import Taro from '@tarojs/taro';
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
};

/** Travel-guide plan sheet on event detail — generation stays on detail / guide detail page. */
export function useEventDetailTravelGuide({
  eventId,
  activityDate,
  activityLocation,
  initialGuideForm = null,
}: UseEventDetailTravelGuideOptions) {
  const [sheetOpen, setSheetOpen] = useState(false);
  const [sheetInitialValues, setSheetInitialValues] =
    useState<AiGuidePlanFormValues | null>(initialGuideForm);

  const defaultNights = useMemo(
    () => parseActivityDayCount(activityDate),
    [activityDate],
  );

  const eventCity = useMemo(
    () => eventCityFromLocation(activityLocation),
    [activityLocation],
  );

  const openGuideSheet = useCallback(
    (prefill?: AiGuidePlanFormValues | null) => {
      requireAuth(() => {
        if (!Number.isFinite(eventId) || eventId <= 0) {
          void Taro.showToast({ title: '活动信息无效', icon: 'none' });
          return;
        }
        if (prefill) {
          setSheetInitialValues(prefill);
        }
        setSheetOpen(true);
      }, 'ai_assistant');
    },
    [eventId],
  );

  const closeGuideSheet = useCallback(() => {
    setSheetOpen(false);
  }, []);

  const handleGuideSheetSubmit = useCallback(
    (form: AiGuidePlanFormValues) => {
      setSheetOpen(false);
      void runTravelGuideGeneration(eventId, form);
    },
    [eventId],
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
