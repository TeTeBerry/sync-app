import { useCallback, useMemo } from 'react';
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

export type UseEventDetailActivityHeaderOptions = {
  eventId: number;
  hasValidEventId: boolean;
  activityQuery: ReturnType<typeof useActivityDetailQuery>;
};

export function useEventDetailActivityHeader({
  eventId,
  hasValidEventId,
  activityQuery,
}: UseEventDetailActivityHeaderOptions) {
  const navInsets = useNavBarInsets();

  const title = activityQuery.data?.name;
  const activityDate = activityQuery.data?.date;
  const activityLocation = activityQuery.data?.location;
  const isOnSite = isActivityOnSite(activityDate, title);

  const activityStatus = getActivityStatusFromActivity(activityDate, title);
  const showHeaderSkeleton =
    hasValidEventId &&
    !title &&
    !activityQuery.isError &&
    (activityQuery.isLoading || activityQuery.data === undefined);
  const showActivityMissing =
    hasValidEventId &&
    !title &&
    !activityQuery.isLoading &&
    !showHeaderSkeleton &&
    (activityQuery.isError || activityQuery.data === null);
  const routeContentReady = Boolean(title) || showHeaderSkeleton || showActivityMissing;
  usePageRouteReady(routeContentReady);

  const metaLine = useMemo(() => {
    if (!activityQuery.data) return '';
    const parts = [activityQuery.data.date, activityQuery.data.location].filter(
      Boolean,
    );
    return parts.join(' · ');
  }, [activityQuery.data]);

  const headerChromePx = stackPageNavChromePx(navInsets, {
    meta: Boolean(metaLine),
  });
  const scrollHeight = useTabPageMainHeight(headerChromePx);

  const loadError = activityQuery.isError && !activityQuery.isLoading;
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
