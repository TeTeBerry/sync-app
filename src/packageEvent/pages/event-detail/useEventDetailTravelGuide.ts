import { useCallback, useMemo, useState } from 'react';
import Taro from '@tarojs/taro';
import { goAiAssistant } from '../../../utils/route';
import { parseActivityDayCount } from '../../../utils/parseActivityDayCount';
import { eventCityFromLocation } from '../../../utils/travelGuideDepartureSuggestions';
import type { AiGuidePlanFormValues } from '../../../types/travelGuide';

export type UseEventDetailTravelGuideOptions = {
  eventId: number;
  activityDate?: string;
  activityLocation?: string;
};

/** Travel-guide plan sheet on event detail — no navigation until the user submits. */
export function useEventDetailTravelGuide({
  eventId,
  activityDate,
  activityLocation,
}: UseEventDetailTravelGuideOptions) {
  const [sheetOpen, setSheetOpen] = useState(false);

  const defaultNights = useMemo(
    () => parseActivityDayCount(activityDate),
    [activityDate],
  );

  const eventCity = useMemo(
    () => eventCityFromLocation(activityLocation),
    [activityLocation],
  );

  const openGuideSheet = useCallback(() => {
    if (!Number.isFinite(eventId) || eventId <= 0) {
      void Taro.showToast({ title: '活动信息无效', icon: 'none' });
      return;
    }
    setSheetOpen(true);
  }, [eventId]);

  const closeGuideSheet = useCallback(() => {
    setSheetOpen(false);
  }, []);

  const handleGuideSheetSubmit = useCallback(
    (form: AiGuidePlanFormValues) => {
      setSheetOpen(false);
      goAiAssistant({ activityLegacyId: eventId, autoRunTravelGuideForm: form });
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
  };
}
