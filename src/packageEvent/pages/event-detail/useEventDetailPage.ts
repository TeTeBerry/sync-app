import { useCallback } from 'react';
import Taro from '@tarojs/taro';
import { useActivityDetailQuery } from '../../../hooks/useSyncApi';
import type { ConfirmDialogOptions } from '../../../hooks/useConfirmDialog';
import { useEventDetailRoute } from './useEventDetailRoute';
import { useEventDetailActivityHeader } from './useEventDetailActivityHeader';
import { useEventDetailScrollPreserve } from './useEventDetailScrollPreserve';
import { useEventDetailTravelGuide } from '@/domains/travel-guide';
import { goExclusiveItinerary, goMyItinerary } from '../../../utils/route';

export type UseEventDetailPageOptions = {
  confirm: (options: ConfirmDialogOptions) => Promise<boolean>;
};

export function useEventDetailPage({ confirm: _confirm }: UseEventDetailPageOptions) {
  const route = useEventDetailRoute();
  const { eventId, scrollTop: routeScrollTop } = route;

  const activityQuery = useActivityDetailQuery(eventId);
  const activityTitle = activityQuery.data?.name;
  const activityDate = activityQuery.data?.date;
  const activityLocation = activityQuery.data?.location;
  const header = useEventDetailActivityHeader({
    eventId,
    hasValidEventId: route.hasValidEventId,
    activityQuery,
  });

  const travelGuide = useEventDetailTravelGuide({
    eventId,
    activityDate,
    activityLocation,
  });

  const { handleScroll, frozenTop, scrollFrozen } = useEventDetailScrollPreserve();
  const scrollTop = scrollFrozen && frozenTop != null ? frozenTop : routeScrollTop;

  const assertValidEventId = useCallback(() => {
    if (!Number.isFinite(eventId) || eventId <= 0) {
      void Taro.showToast({ title: '活动信息无效', icon: 'none' });
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

  const handleOpenExclusiveItinerary = useCallback(() => {
    if (!assertValidEventId()) {
      return;
    }
    goExclusiveItinerary(eventId);
  }, [assertValidEventId, eventId]);

  return {
    ...header,
    eventId,
    scrollTop,
    scrollFrozen,
    handleScroll,
    handleOpenAiGuide: travelGuide.openGuideSheet,
    activityTitle,
    handleOpenMyItinerary,
    handleOpenExclusiveItinerary,
    guideSheetOpen: travelGuide.guideSheetOpen,
    closeGuideSheet: travelGuide.closeGuideSheet,
    handleGuideSheetSubmit: travelGuide.handleGuideSheetSubmit,
    guideDefaultNights: travelGuide.guideDefaultNights,
    guideEventCity: travelGuide.guideEventCity,
    invalidEventId: route.invalidEventId,
  };
}
