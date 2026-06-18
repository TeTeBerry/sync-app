import { useEffect, useMemo } from 'react';
import { useAccountRisk } from '../../../../hooks/useAccountRisk';
import { useConfirmDialog } from '../../../../hooks/useConfirmDialog';
import { useKeyboardInset } from '../../../../hooks/useKeyboardInset';
import { useActivityDetailQuery } from '../../../../hooks/useSyncApi';
import { eventCityFromLocation } from '../../../../utils/travelGuideDepartureSuggestions';
import type { inferUserGenderFromName } from '../../../../utils/inferAuthorGender';
import type { AiGuidePlanFormValues } from '../../../../types/travelGuide';
import type { FestivalPlanTaskActions } from '../../../../domains/festival-plan/festivalPlanTaskActions';
import type { ActivityBindingActions } from '../activityBindingActions';
import { useAiAssistantChatStream } from './useAiAssistantChatStream';
import { useAiAssistantScroll } from './useAiAssistantScroll';
import { useAiActivityBinding } from './useAiActivityBinding';
import { useAiAssistantCapabilitySheets } from './useAiAssistantCapabilitySheets';
import { useAiAssistantComposer } from './useAiAssistantComposer';
import { useAiAssistantInitialIntents } from './useAiAssistantInitialIntents';

export type UseAiAssistantOrchestratorOptions = {
  initialMessage?: string | null;
  initialOpenAiGuideSheet?: boolean;
  initialPrefillTravelGuideForm?: AiGuidePlanFormValues | null;
  initialAutoRunTravelGuideForm?: AiGuidePlanFormValues | null;
  activityLegacyId?: number;
  activityTitle?: string;
  /** When provided, skips a duplicate activity detail fetch in the orchestrator. */
  activityLocation?: string;
  onInitialMessageSent?: () => void;
  pageShowSeq?: number;
  onMessageCountChange?: (count: number) => void;
  userAvatar?: string;
  userName: string;
  userGender?: ReturnType<typeof inferUserGenderFromName>;
  onFestivalPlanActionsChange?: (actions: FestivalPlanTaskActions | null) => void;
  onActivityBindingActionsChange?: (actions: ActivityBindingActions | null) => void;
};

export function useAiAssistantOrchestrator(options: UseAiAssistantOrchestratorOptions) {
  const {
    initialMessage,
    initialOpenAiGuideSheet = false,
    initialPrefillTravelGuideForm = null,
    initialAutoRunTravelGuideForm = null,
    activityLegacyId,
    activityTitle,
    activityLocation,
    onInitialMessageSent,
    pageShowSeq = 0,
    onMessageCountChange,
    userAvatar,
    userName,
    onFestivalPlanActionsChange,
  } = options;

  const onActivityBindingActionsChange = options.onActivityBindingActionsChange;

  const keyboardInset = useKeyboardInset();
  const activityQuery = useActivityDetailQuery(
    activityLocation != null ? undefined : activityLegacyId,
  );
  const { accountRisk } = useAccountRisk();
  const { confirm, confirmDialog } = useConfirmDialog({
    confirmText: '清空',
    cancelText: '取消',
  });

  const guideEventCity = useMemo(
    () => eventCityFromLocation(activityLocation ?? activityQuery.data?.location),
    [activityLocation, activityQuery.data?.location],
  );

  const chat = useAiAssistantChatStream({ activityTitle, activityLegacyId });
  const { forceScrollToBottomKey, scheduleScrollToBottom } = useAiAssistantScroll({
    messagesRef: chat.messagesRef,
    messageCount: chat.messages.length,
    pageShowSeq,
  });

  const activityBinding = useAiActivityBinding({
    applyActivityBinding: chat.applyActivityBinding,
    scheduleScrollToBottom,
    onActivityBindingActionsChange,
  });

  const capabilities = useAiAssistantCapabilitySheets({
    activityLegacyId,
    activityTitle,
    activityDate: activityQuery.data?.date,
    userName,
    userAvatar,
    setMessages: chat.setMessages,
    messagesRef: chat.messagesRef,
    isStreaming: chat.isStreaming,
    sessionIdRef: chat.sessionIdRef,
    scheduleScrollToBottom,
    onFestivalPlanActionsChange,
  });

  const composer = useAiAssistantComposer({
    activityLegacyId,
    isStreaming: chat.isStreaming,
    isStreamingRef: chat.isStreamingRef,
    send: chat.send,
    clearChat: chat.clearChat,
    confirm,
    capabilityRunner: capabilities.capabilityRunner,
    openPersonalityTest: capabilities.handleOpenPersonalityTest,
    openActivityPicker: activityBinding.openActivityPicker,
  });

  useAiAssistantInitialIntents({
    initialMessage,
    initialOpenAiGuideSheet,
    initialPrefillTravelGuideForm,
    initialAutoRunTravelGuideForm,
    activityLegacyId,
    isStreaming: chat.isStreaming,
    send: chat.send,
    travelGuide: capabilities.travelGuide,
    runCapability: capabilities.capabilityRunner.runCapability,
    onInitialMessageSent,
  });

  useEffect(() => {
    onMessageCountChange?.(chat.messages.length);
  }, [chat.messages.length, onMessageCountChange]);

  return {
    keyboardInset,
    activityQuery,
    accountRisk,
    confirmDialog,
    guideEventCity,
    messages: chat.messages,
    isStreaming: chat.isStreaming,
    isLoadingHistory: chat.isLoadingHistory,
    hasMoreHistory: chat.hasMoreHistory,
    loadOlderMessages: chat.loadOlderMessages,
    forceScrollToBottomKey,
    composer,
    capabilities,
    activityBinding,
  };
}
