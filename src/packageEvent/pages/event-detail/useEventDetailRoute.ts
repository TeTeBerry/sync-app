import { useRouter } from '@tarojs/taro';
import { useEffect, useMemo, useState } from 'react';
import { resolveEventDetailIdFromQuery, warmAiAssistant } from '../../../utils/route';
import { useDeferredMount } from '../../../hooks/useDeferredMount';
import { DEFER_EVENT_POSTS_MS } from '../../../utils/timing';
import { useNavigationStore } from '../../../stores/navigationStore';

export function useEventDetailRoute() {
  const router = useRouter();
  const activeActivityLegacyId = useNavigationStore(
    (state) => state.activeActivityLegacyId,
  );
  const [scrollTop, setScrollTop] = useState<number | undefined>();
  const feedReady = useDeferredMount(DEFER_EVENT_POSTS_MS);
  const composerReady = useDeferredMount(0);

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
    warmAiAssistant();
  }, []);

  const invalidEventId = Number.isNaN(eventId) || eventId <= 0;
  const hasValidEventId = Number.isFinite(eventId) && eventId > 0;

  return {
    eventId,
    highlightPostId,
    scrollTop,
    setScrollTop,
    feedReady,
    composerReady,
    invalidEventId,
    hasValidEventId,
  };
}
