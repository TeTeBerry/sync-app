import { useCallback, useEffect, useMemo } from 'react';
import { useAccountRisk } from '../../../../hooks/useAccountRisk';
import { useConfirmDialog } from '../../../../hooks/useConfirmDialog';
import { useKeyboardInset } from '../../../../hooks/useKeyboardInset';
import { useActivityDetailQuery } from '../../../../hooks/useSyncApi';
import type { inferUserGenderFromName } from '../../../../utils/inferAuthorGender';
import type { AiGuidePlanFormValues } from '../../../../types/travelGuide';
import type { FestivalPlanTaskActions } from '../../../../domains/festival-plan/festivalPlanTaskActions';
import type { FestivalPlanTaskKey } from '../../../../domains/festival-plan/festivalPlanTaskDefs';
import type { ActivityBindingActions } from '../activityBindingActions';
import type { AiTabQuickActionsHandlers } from '../../components/aiTabQuickActions.types';
import { useAiAssistantChatStream } from './useAiAssistantChatStream';
import { useAiAssistantScroll } from './useAiAssistantScroll';
import { useAiActivityBinding } from './useAiActivityBinding';
import { useAiAssistantCapabilitySheets } from './useAiAssistantCapabilitySheets';
import { useAiAssistantComposer } from './useAiAssistantComposer';
import { useAiAssistantInitialIntents } from './useAiAssistantInitialIntents';
import {
  resolveOrchestratorActivityQueryId,
  resolveOrchestratorGuideEventCity,
} from './aiAssistantOrchestrator.util';
import {
  buildWelcomeCapabilityChipLabels,
  isActivityBoundForCapabilities,
} from '../../../../utils/aiAssistantCapabilityDiscovery';
import { isWelcomeOnlyMessages } from '../../../../utils/mapChatHistory';
import { goActivityLineup, goActivitySchedule } from '../../../../utils/route';

export type UseAiAssistantOrchestratorOptions = {
  initialMessage?: string | null;
  initialOpenAiGuideSheet?: boolean;
  initialOpenItinerarySheet?: boolean;
  initialOpenBuddyPostSheet?: boolean;
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
  onAiQuickActionsChange?: (handlers: AiTabQuickActionsHandlers | null) => void;
  festivalPlanNextTaskKey?: FestivalPlanTaskKey;
  festivalPlanHasItinerary?: boolean;
};

export function useAiAssistantOrchestrator(options: UseAiAssistantOrchestratorOptions) {
  const {
    initialMessage,
    initialOpenAiGuideSheet = false,
    initialOpenItinerarySheet = false,
    initialOpenBuddyPostSheet = false,
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
    festivalPlanNextTaskKey,
    festivalPlanHasItinerary = false,
  } = options;

  const onActivityBindingActionsChange = options.onActivityBindingActionsChange;
  const onAiQuickActionsChange = options.onAiQuickActionsChange;

  const keyboardInset = useKeyboardInset();
  const activityQuery = useActivityDetailQuery(
    resolveOrchestratorActivityQueryId(activityLegacyId, activityLocation),
  );
  const { accountRisk } = useAccountRisk();
  const { confirm, confirmDialog } = useConfirmDialog({
    confirmText: '清空',
    cancelText: '取消',
  });

  const guideEventCity = useMemo(
    () =>
      resolveOrchestratorGuideEventCity(activityLocation, activityQuery.data?.location),
    [activityLocation, activityQuery.data?.location],
  );

  const chat = useAiAssistantChatStream({
    activityTitle,
    activityLegacyId,
    festivalPlanNextTaskKey,
  });
  const { forceScrollToBottomKey, scheduleScrollToBottom } = useAiAssistantScroll({
    messagesRef: chat.messagesRef,
    messageCount: chat.messages.length,
    pageShowSeq,
  });

  const activityBinding = useAiActivityBinding({
    applyActivityBinding: chat.applyActivityBinding,
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

  const openLineup = useCallback(() => {
    if (activityLegacyId == null || Number.isNaN(activityLegacyId)) return;
    goActivityLineup(activityLegacyId);
  }, [activityLegacyId]);

  const openSchedule = useCallback(() => {
    if (activityLegacyId == null || Number.isNaN(activityLegacyId)) return;
    goActivitySchedule(activityLegacyId, { hasItinerary: festivalPlanHasItinerary });
  }, [activityLegacyId, festivalPlanHasItinerary]);

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
    openLineup,
    openSchedule,
    festivalPlanHasItinerary,
  });

  useAiAssistantInitialIntents({
    initialMessage,
    initialOpenAiGuideSheet,
    initialOpenItinerarySheet,
    initialOpenBuddyPostSheet,
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

  useEffect(() => {
    if (!isActivityBoundForCapabilities(activityLegacyId)) return;

    const nextChips = buildWelcomeCapabilityChipLabels(true, festivalPlanNextTaskKey);
    chat.setMessages((prev) => {
      if (!isWelcomeOnlyMessages(prev)) return prev;
      const welcome = prev[0];
      if (!welcome?.isWelcome) return prev;

      const current = welcome.suggestedReplies ?? [];
      if (
        current.length === nextChips.length &&
        current.every((chip, index) => chip === nextChips[index])
      ) {
        return prev;
      }

      return [{ ...welcome, suggestedReplies: nextChips }];
    });
  }, [activityLegacyId, chat.setMessages, festivalPlanNextTaskKey]);

  useEffect(() => {
    if (!onAiQuickActionsChange) return;
    if (!isActivityBoundForCapabilities(activityLegacyId)) {
      onAiQuickActionsChange(null);
      return;
    }
    onAiQuickActionsChange({
      openLineup,
      openSchedule,
      runCapability: capabilities.capabilityRunner.runCapability,
    });
    return () => onAiQuickActionsChange(null);
  }, [
    activityLegacyId,
    capabilities.capabilityRunner.runCapability,
    onAiQuickActionsChange,
    openLineup,
    openSchedule,
  ]);

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
