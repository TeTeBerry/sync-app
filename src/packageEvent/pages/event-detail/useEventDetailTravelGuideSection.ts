import { useCallback, useEffect, useMemo, useRef } from 'react';
import {
  findLatestTravelGuideForActivity,
  useEventDetailTravelGuide,
} from '@/domains/travel-guide';
import { goAiTravelGuide } from '../../../utils/route';
import { showAppToast } from '@/utils/appToast';
import type { EventDetailTravelGuideNavIntent } from '../../../stores/types';

export type UseEventDetailTravelGuideSectionOptions = {
  eventId: number;
  activityDate?: string;
  activityLocation?: string;
  travelGuideNavIntent: EventDetailTravelGuideNavIntent | null;
  openGuideOnMount: boolean;
  secondaryReady: boolean;
  invalidEventId: boolean;
};

export function useEventDetailTravelGuideSection({
  eventId,
  activityDate,
  activityLocation,
  travelGuideNavIntent,
  openGuideOnMount,
  secondaryReady,
  invalidEventId,
}: UseEventDetailTravelGuideSectionOptions) {
  const guideSheetOpenedRef = useRef(false);

  const travelGuide = useEventDetailTravelGuide({
    eventId,
    activityDate,
    activityLocation,
    initialGuideForm: travelGuideNavIntent?.prefillTravelGuideForm ?? null,
    regenerateGuideId: travelGuideNavIntent?.regenerateGuideId ?? null,
  });

  useEffect(() => {
    if (
      !openGuideOnMount ||
      guideSheetOpenedRef.current ||
      invalidEventId ||
      !secondaryReady
    ) {
      return;
    }
    guideSheetOpenedRef.current = true;
    travelGuide.openGuideSheet(travelGuideNavIntent?.prefillTravelGuideForm ?? null);
  }, [
    openGuideOnMount,
    invalidEventId,
    secondaryReady,
    travelGuide,
    travelGuideNavIntent?.prefillTravelGuideForm,
  ]);

  return { travelGuide };
}

export type UseEventDetailTravelGuideActionsOptions = {
  eventId: number;
  travelGuideSupported?: boolean;
  festivalPlanTravelGuideId?: string | null;
  openGuideSheet: () => void;
};

export function useEventDetailTravelGuideActions({
  eventId,
  travelGuideSupported,
  festivalPlanTravelGuideId,
  openGuideSheet,
}: UseEventDetailTravelGuideActionsOptions) {
  const handleOpenAiGuide = useCallback(() => {
    if (
      travelGuideSupported === false &&
      !findLatestTravelGuideForActivity(eventId)?.guideId &&
      !festivalPlanTravelGuideId
    ) {
      showAppToast('travelGuide.preparingToast', { icon: 'none' });
      return;
    }
    const guideId =
      festivalPlanTravelGuideId?.trim() ||
      findLatestTravelGuideForActivity(eventId)?.guideId;
    if (guideId) {
      goAiTravelGuide(guideId);
      return;
    }
    openGuideSheet();
  }, [eventId, festivalPlanTravelGuideId, openGuideSheet, travelGuideSupported]);

  const travelGuideGenerated = useMemo(
    () =>
      Boolean(festivalPlanTravelGuideId || findLatestTravelGuideForActivity(eventId)),
    [eventId, festivalPlanTravelGuideId],
  );

  return { handleOpenAiGuide, travelGuideGenerated };
}
