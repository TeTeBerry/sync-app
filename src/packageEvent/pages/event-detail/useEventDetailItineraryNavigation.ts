import { useCallback } from 'react';
import { findLatestTravelGuideForActivity } from '@/domains/travel-guide';
import {
  goActivityLineup,
  goExclusiveItinerary,
  goMyItinerary,
} from '../../../utils/route';
import { showAppToast } from '@/utils/appToast';

export function useEventDetailItineraryNavigation(eventId: number) {
  const assertValidEventId = useCallback(() => {
    if (!Number.isFinite(eventId) || eventId <= 0) {
      showAppToast('eventDetail.invalidActivity', { icon: 'none' });
      return false;
    }
    return true;
  }, [eventId]);

  const handleOpenMyItinerary = useCallback(() => {
    if (!assertValidEventId()) {
      return;
    }
    const guideHeadcount = findLatestTravelGuideForActivity(eventId)?.form.headcount;
    goMyItinerary(eventId, undefined, {
      headcount:
        guideHeadcount != null && guideHeadcount > 0 ? guideHeadcount : undefined,
    });
  }, [assertValidEventId, eventId]);

  const handleOpenActivityLineup = useCallback(() => {
    if (!assertValidEventId()) {
      return;
    }
    goActivityLineup(eventId);
  }, [assertValidEventId, eventId]);

  const handleOpenExclusiveItinerary = useCallback(() => {
    if (!assertValidEventId()) {
      return;
    }
    goExclusiveItinerary(eventId);
  }, [assertValidEventId, eventId]);

  return {
    handleOpenMyItinerary,
    handleOpenActivityLineup,
    handleOpenExclusiveItinerary,
  };
}
