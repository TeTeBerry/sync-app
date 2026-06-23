import { useCallback } from 'react';
import Taro from '@tarojs/taro';
import {
  goActivityLineup,
  goExclusiveItinerary,
  goMyItinerary,
} from '../../../utils/route';
import { t } from '@/i18n/translate';

export function useEventDetailItineraryNavigation(eventId: number) {
  const assertValidEventId = useCallback(() => {
    if (!Number.isFinite(eventId) || eventId <= 0) {
      void Taro.showToast({ title: t('eventDetail.invalidActivity'), icon: 'none' });
      return false;
    }
    return true;
  }, [eventId]);

  const handleOpenMyItinerary = useCallback(() => {
    if (!assertValidEventId()) {
      return;
    }
    goMyItinerary(eventId);
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
