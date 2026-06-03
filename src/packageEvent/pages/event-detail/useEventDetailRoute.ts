import { useRouter } from '@tarojs/taro';
import { useEffect, useMemo, useState } from 'react';
import { resolveEventDetailIdFromQuery, warmAiAssistant } from '../../../utils/route';
import { useDeferredMount } from '../../../hooks/useDeferredMount';
import {
  DEFER_EVENT_AI_WARM_MS,
  DEFER_EVENT_COMPOSER_MS,
  DEFER_EVENT_POSTS_MS,
  DEFER_EVENT_SECONDARY_MS,
} from '../../../utils/timing';
import { selectActiveActivityLegacyId, useNavigationStore } from '../../../stores';

export function useEventDetailRoute() {
  const router = useRouter();
  const activeActivityLegacyId = useNavigationStore(selectActiveActivityLegacyId);
  const [scrollTop, setScrollTop] = useState<number | undefined>();
  const composerReady = useDeferredMount(DEFER_EVENT_COMPOSER_MS);
  const feedReady = useDeferredMount(DEFER_EVENT_POSTS_MS);
  const secondaryReady = useDeferredMount(DEFER_EVENT_SECONDARY_MS);
  const aiWarmReady = useDeferredMount(DEFER_EVENT_AI_WARM_MS);

  const eventId = useMemo(
    () => resolveEventDetailIdFromQuery(router.params, activeActivityLegacyId),
    [activeActivityLegacyId, router.params],
  );
  const highlightPostId = router.params.postId?.trim() || '';

  useEffect(() => {
    if (Number.isFinite(eventId) && eventId > 0) {
      useNavigationStore.getState().setActiveActivityLegacyId(eventId);
    }
  }, [eventId]);

  useEffect(() => {
    if (!aiWarmReady) return;
    warmAiAssistant();
  }, [aiWarmReady]);

  const invalidEventId = Number.isNaN(eventId) || eventId <= 0;
  const hasValidEventId = Number.isFinite(eventId) && eventId > 0;

  return {
    eventId,
    highlightPostId,
    scrollTop,
    setScrollTop,
    composerReady,
    feedReady,
    secondaryReady,
    invalidEventId,
    hasValidEventId,
  };
}
