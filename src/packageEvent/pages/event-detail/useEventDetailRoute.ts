import { useRouter } from '@tarojs/taro';
import { useEffect, useMemo, useState } from 'react';
import { bindActivity } from '../../../domains/activity-scope';
import { resolveEventDetailIdFromQuery } from '../../../utils/route';
import { useDeferredMount } from '../../../hooks/useDeferredMount';
import { DEFER_EVENT_SECONDARY_MS } from '../../../utils/timing';
import { selectActiveActivityLegacyId, useNavigationStore } from '../../../stores';
import { parseEventDetailRouteFlags } from './eventDetailRoute.util';

export function useEventDetailRoute() {
  const router = useRouter();
  const activeActivityLegacyId = useNavigationStore(selectActiveActivityLegacyId);
  const [scrollTop, setScrollTop] = useState<number | undefined>();
  const secondaryReady = useDeferredMount(DEFER_EVENT_SECONDARY_MS);

  const eventId = useMemo(
    () => resolveEventDetailIdFromQuery(router.params, activeActivityLegacyId),
    [activeActivityLegacyId, router.params],
  );
  const {
    highlightPostId,
    focusPostsOnMount,
    openBuddyPostOnMount,
    openCommentsOnMount,
    openGuideOnMount,
  } = parseEventDetailRouteFlags(router.params);
  useEffect(() => {
    if (Number.isFinite(eventId) && eventId > 0) {
      bindActivity(eventId);
    }
  }, [eventId]);

  const invalidEventId = Number.isNaN(eventId) || eventId <= 0;
  const hasValidEventId = Number.isFinite(eventId) && eventId > 0;

  return {
    eventId,
    highlightPostId,
    focusPostsOnMount,
    openBuddyPostOnMount,
    openCommentsOnMount,
    openGuideOnMount,
    scrollTop,
    setScrollTop,
    secondaryReady,
    invalidEventId,
    hasValidEventId,
  };
}
