import { useRouter } from '@tarojs/taro';
import { useEffect, useMemo, useState } from 'react';
import { bindActivity } from '../../../domains/activity-scope';
import { resolveEventDetailIdFromQuery, warmAiAssistant } from '../../../utils/route';
import { useDeferredMount } from '../../../hooks/useDeferredMount';
import {
  DEFER_EVENT_AI_WARM_MS,
  DEFER_EVENT_SECONDARY_MS,
} from '../../../utils/timing';
import { selectActiveActivityLegacyId, useNavigationStore } from '../../../stores';
import {
  parseEventDetailRouteFlags,
  shouldWarmEventDetailAi,
} from './eventDetailRoute.util';

export function useEventDetailRoute() {
  const router = useRouter();
  const activeActivityLegacyId = useNavigationStore(selectActiveActivityLegacyId);
  const [scrollTop, setScrollTop] = useState<number | undefined>();
  const secondaryReady = useDeferredMount(DEFER_EVENT_SECONDARY_MS);
  const aiWarmReady = useDeferredMount(DEFER_EVENT_AI_WARM_MS);

  const eventId = useMemo(
    () => resolveEventDetailIdFromQuery(router.params, activeActivityLegacyId),
    [activeActivityLegacyId, router.params],
  );
  const { highlightPostId, focusPostsOnMount, openBuddyPostOnMount } =
    parseEventDetailRouteFlags(router.params);
  useEffect(() => {
    if (Number.isFinite(eventId) && eventId > 0) {
      bindActivity(eventId);
    }
  }, [eventId]);

  useEffect(() => {
    if (!shouldWarmEventDetailAi(aiWarmReady)) return;
    warmAiAssistant();
  }, [aiWarmReady]);

  const invalidEventId = Number.isNaN(eventId) || eventId <= 0;
  const hasValidEventId = Number.isFinite(eventId) && eventId > 0;

  return {
    eventId,
    highlightPostId,
    focusPostsOnMount,
    openBuddyPostOnMount,
    scrollTop,
    setScrollTop,
    secondaryReady,
    invalidEventId,
    hasValidEventId,
  };
}
