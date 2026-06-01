import { useCallback, useMemo } from 'react';
import { goBack, ROUTES } from '../../../utils/route';
import { usePageRouteReady } from '../../../hooks/usePageRouteReady';
import {
  activityStatusCardClass,
  getActivityStatusFromActivity,
} from '../../../utils/activityStatus';
import { stackPageNavChromePx } from '../../../components/navigation/PageNavigation';
import { useNavBarInsets } from '../../../hooks/useNavBarInsets';
import { useTabPageMainHeight } from '../../../hooks/useTabPageMainHeight';
import { usePostPageShare } from '../../../hooks/usePostPageShare';
import type { PostSharePayload } from '../../../utils/postShare';
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
  const activityImage = activityQuery.data?.image;
  const activityDate = activityQuery.data?.date;

  const getDefaultShare = useCallback((): PostSharePayload | null => {
    if (!Number.isFinite(eventId) || eventId <= 0) {
      return null;
    }
    return {
      postId: '',
      activityLegacyId: eventId,
      eventTitle: title,
      imageUrl: activityImage,
    };
  }, [activityImage, eventId, title]);

  usePostPageShare({ getDefaultShare });

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

  const handleBack = useCallback(() => {
    goBack(ROUTES.HOME);
  }, []);

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
    activityStatusClass: activityStatusCardClass(activityStatus),
    showHeaderSkeleton,
    loadError,
    showActivityMissing,
    onRetryActivity,
    handleBack,
  };
}
