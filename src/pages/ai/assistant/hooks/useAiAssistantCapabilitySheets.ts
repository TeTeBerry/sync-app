import { useCallback, useEffect, useMemo, type MutableRefObject } from 'react';
import Taro from '@tarojs/taro';
import { useAiBuddyPost } from '../../../../hooks/useAiBuddyPost';
import { useAiTravelGuide } from '../../../../hooks/useAiTravelGuide';
import { invalidatePostQueries } from '../../../../hooks/useSyncApi';
import { invalidateCache } from '../../../../hooks/useApiQuery';
import { parseActivityDayCount } from '../../../../utils/parseActivityDayCount';
import { goExclusiveItinerary, goPersonalityTest } from '../../../../utils/route';
import type { ChatUiMessage } from '../../../../types/aiChat';
import type { FestivalPlanTaskActions } from '../../../../domains/festival-plan/festivalPlanTaskActions';
import type { Dispatch, SetStateAction } from 'react';
import { useAiCapabilityRunner } from './useAiCapabilityRunner';

export function useAiAssistantCapabilitySheets(options: {
  activityLegacyId?: number;
  activityTitle?: string;
  activityDate?: string;
  userName: string;
  userAvatar?: string;
  setMessages: Dispatch<SetStateAction<ChatUiMessage[]>>;
  messagesRef: MutableRefObject<ChatUiMessage[]>;
  isStreaming: boolean;
  sessionIdRef: MutableRefObject<string>;
  scheduleScrollToBottom: () => void;
  onFestivalPlanActionsChange?: (actions: FestivalPlanTaskActions | null) => void;
}) {
  const {
    activityLegacyId,
    activityTitle,
    activityDate,
    userName,
    userAvatar,
    setMessages,
    messagesRef,
    isStreaming,
    sessionIdRef,
    scheduleScrollToBottom,
    onFestivalPlanActionsChange,
  } = options;

  const defaultGuideNights = useMemo(
    () => parseActivityDayCount(activityDate),
    [activityDate],
  );

  const handleBuddyPostPublished = useCallback(async () => {
    await invalidatePostQueries();
    if (activityLegacyId != null) {
      invalidateCache(['posts', 'activity', activityLegacyId]);
    }
  }, [activityLegacyId]);

  const buddyPost = useAiBuddyPost({
    activityLegacyId,
    activityTitle,
    activityDate,
    authorName: userName,
    authorAvatar: userAvatar,
    setMessages,
    messagesRef,
    isStreaming,
    onPublished: handleBuddyPostPublished,
    onPlanningMessagesShown: scheduleScrollToBottom,
  });

  const travelGuide = useAiTravelGuide({
    activityLegacyId,
    activityTitle,
    defaultNights: defaultGuideNights,
    setMessages,
    messagesRef,
    isStreaming,
    sessionIdRef,
    onPlanningMessagesShown: scheduleScrollToBottom,
  });

  const handleOpenItinerarySheet = useCallback(() => {
    if (activityLegacyId == null) {
      void Taro.showToast({ title: '请先进入活动后再生成行程', icon: 'none' });
      return;
    }
    goExclusiveItinerary(activityLegacyId);
  }, [activityLegacyId]);

  const handleOpenPersonalityTest = useCallback(() => {
    goPersonalityTest();
  }, []);

  const capabilityHandlers = useMemo(
    () => ({
      openTravelGuideSheet: travelGuide.openGuideSheet,
      openItinerary: handleOpenItinerarySheet,
      openBuddyPostSheet: buddyPost.openBuddyPostSheetWithTag,
    }),
    [
      buddyPost.openBuddyPostSheetWithTag,
      handleOpenItinerarySheet,
      travelGuide.openGuideSheet,
    ],
  );

  const capabilityRunner = useAiCapabilityRunner(capabilityHandlers);

  useEffect(() => {
    if (!onFestivalPlanActionsChange) return;
    onFestivalPlanActionsChange({
      runCapability: capabilityRunner.runCapability,
    });
    return () => onFestivalPlanActionsChange(null);
  }, [capabilityRunner.runCapability, onFestivalPlanActionsChange]);

  const composerBusy =
    isStreaming || travelGuide.isGenerating || buddyPost.isPublishing;

  return {
    buddyPost,
    travelGuide,
    capabilityRunner,
    defaultGuideNights,
    handleOpenPersonalityTest,
    composerBusy,
  };
}
