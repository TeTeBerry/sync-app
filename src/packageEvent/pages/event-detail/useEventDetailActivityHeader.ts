import { useCallback } from 'react';
import { usePageRouteReady } from '../../../hooks/usePageRouteReady';
import {
  activityStatusCardClass,
  getActivityStatusFromActivity,
  isActivityOnSite,
} from '../../../utils/activityStatus';
import { stackPageNavChromePx } from '../../../components/navigation/PageNavigation';
import { useNavBarInsets } from '../../../hooks/useNavBarInsets';
import { useTabPageMainHeight } from '../../../hooks/useTabPageMainHeight';
import type { useActivityDetailQuery } from '../../../hooks/useSyncApi';
import { resolveEventDetailHeaderPresentation } from './eventDetailActivityHeader.util';

export type UseEventDetailActivityHeaderOptions = {
  eventId: number;
  hasValidEventId: boolean;
  activityQuery: ReturnType<typeof useActivityDetailQuery>;
};

export function useEventDetailActivityHeader({
  eventId: _eventId,
  hasValidEventId,
  activityQuery,
}: UseEventDetailActivityHeaderOptions) {
  const navInsets = useNavBarInsets();

  const header = resolveEventDetailHeaderPresentation({
    hasValidEventId,
    query: activityQuery,
  });
  const {
    title,
    activityDate,
    activityLocation,
    metaLine,
    showHeaderSkeleton,
    showActivityMissing,
    routeContentReady,
    loadError,
  } = header;

  const isOnSite = isActivityOnSite(activityDate, title);
  const activityStatus = getActivityStatusFromActivity(activityDate, title);
  usePageRouteReady(routeContentReady);

  const headerChromePx = stackPageNavChromePx(navInsets, {
    meta: Boolean(metaLine),
  });
  const scrollHeight = useTabPageMainHeight(headerChromePx);

  const onRetryActivity = useCallback(() => {
    void activityQuery.refetch();
  }, [activityQuery]);

  return {
    navInsets,
    title,
    metaLine,
    scrollHeight,
    activityStatus,
    isOnSite,
    activityLocation,
    activityDate,
    activityStatusClass: activityStatusCardClass(activityStatus),
    showHeaderSkeleton,
    loadError,
    showActivityMissing,
    onRetryActivity,
  };
}
