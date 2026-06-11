import Taro from '@tarojs/taro';
import { useCallback, useEffect, useRef, useState } from 'react';
import type { EventLiveInfoTabActions } from '../components/EventLiveInfoTab';
import type { PublishLiveInfoPayload } from './useEventLiveInfo';
import type { EventDetailTabId } from '@/packageEvent/pages/event-detail/components/EventDetailContentTabs';

export type UseEventDetailLiveOptions = {
  contentTab: EventDetailTabId;
  showHeaderSkeleton: boolean;
};

export function useEventDetailLive({
  contentTab,
  showHeaderSkeleton,
}: UseEventDetailLiveOptions) {
  const [liveFeedCount, setLiveFeedCount] = useState(0);
  const [liveUpdateSheetOpen, setLiveUpdateSheetOpen] = useState(false);
  const liveInfoActionsRef = useRef<EventLiveInfoTabActions | null>(null);

  const handleLiveFeedCountChange = useCallback((count: number) => {
    setLiveFeedCount(count);
  }, []);

  const handleLiveInfoActions = useCallback(
    (actions: EventLiveInfoTabActions | null) => {
      liveInfoActionsRef.current = actions;
    },
    [],
  );

  const handleOpenLiveUpdateSheet = useCallback(() => {
    setLiveUpdateSheetOpen(true);
  }, []);

  const handleCloseLiveUpdateSheet = useCallback(() => {
    setLiveUpdateSheetOpen(false);
  }, []);

  const handleLiveUpdatePublish = useCallback(
    async (payload: PublishLiveInfoPayload): Promise<boolean> => {
      const actions = liveInfoActionsRef.current;
      if (!actions) {
        void Taro.showToast({ title: '请稍候再试', icon: 'none' });
        return false;
      }
      return actions.publishUpdate(payload);
    },
    [],
  );

  useEffect(() => {
    if (contentTab !== 'live') {
      setLiveUpdateSheetOpen(false);
    }
  }, [contentTab]);

  const showLiveEnd = contentTab === 'live' && !showHeaderSkeleton && liveFeedCount > 0;

  return {
    liveFeedCount,
    liveUpdateSheetOpen,
    handleLiveFeedCountChange,
    handleLiveInfoActions,
    handleOpenLiveUpdateSheet,
    handleCloseLiveUpdateSheet,
    handleLiveUpdatePublish,
    showLiveEnd,
  };
}
