import React, { memo, useCallback } from 'react';
import { ChatMessageList } from '../../../components/ai-chat/ChatMessageList';
import { ChatComposer } from '../../../components/ai-chat/ChatComposer';
import { AccountRiskBanner } from '../../../components/account-risk/AccountRiskBanner';
import { AiBuddyPostSheet } from '../../../components/ai-chat/AiBuddyPostSheet';
import { AiActivityPickerSheet } from '../../../components/ai-chat/AiActivityPickerSheet';
import { AiGuidePlanSheet } from '../../../components/ai-chat/AiGuidePlanSheet';
import type { inferUserGenderFromName } from '../../../utils/inferAuthorGender';
import type { ChatUiMessage } from '../../../types/aiChat';
import type { AiGuidePlanFormValues } from '../../../types/travelGuide';
import type { AiCapability } from '@/domains/ai-capability';
import { cn } from '@/components/ui';
import { View } from '@tarojs/components';
import {
  useAiAssistantOrchestrator,
  type UseAiAssistantOrchestratorOptions,
} from './hooks/useAiAssistantOrchestrator';
import {
  AI_CHAT_SCROLL_HOST_ID,
  useAiChatScrollAreaHeight,
} from './hooks/useAiChatScrollAreaHeight';
import { AiAssistantChatCollapse } from '../components/AiAssistantChatCollapse';
import { isWeappRuntime } from './aiChatLayout.util';

export type AiAssistantChatProps = UseAiAssistantOrchestratorOptions & {
  /** Bump when chrome above the chat column changes size (festival plan expand, etc.). */
  layoutRemeasureKey?: string | number;
  onChatChromeLayoutChange?: () => void;
  userGender?: ReturnType<typeof inferUserGenderFromName>;
};

type AiAssistantChatFooterProps = {
  activityLegacyId?: number;
  activityTitle?: string;
  composerResetKey: number;
  composerBusy: boolean;
  keyboardInset: number;
  onSubmit: (text: string) => void | Promise<void>;
  onClearChat: () => void | Promise<void>;
};

const AiAssistantChatFooter = memo(function AiAssistantChatFooter({
  activityLegacyId,
  activityTitle,
  composerResetKey,
  composerBusy,
  keyboardInset,
  onSubmit,
  onClearChat,
}: AiAssistantChatFooterProps) {
  return (
    <View
      className={cn(
        's-ai-assistant-chat__footer',
        isWeappRuntime && 's-ai-assistant-chat__footer--weapp-fixed',
      )}
      style={keyboardInset > 0 ? { paddingBottom: `${keyboardInset}px` } : undefined}
    >
      <ChatComposer
        key={activityLegacyId ?? 'none'}
        resetKey={composerResetKey}
        isStreaming={composerBusy}
        activityLegacyId={activityLegacyId}
        activityTitle={activityTitle}
        onSubmit={onSubmit}
        onClearChat={onClearChat}
        clearDisabled={composerBusy}
      />
    </View>
  );
});

type AiAssistantChatMessagesProps = {
  scrollRemeasureKey: string;
  sheetOverlayOpen: boolean;
  messages: ChatUiMessage[];
  isStreaming: boolean;
  isTravelGuideGenerating: boolean;
  keyboardInset: number;
  forceScrollToBottomKey: number;
  isLoadingHistory: boolean;
  hasMoreHistory: boolean;
  loadOlderMessages?: () => Promise<number>;
  activityLegacyId?: number;
  userAvatar?: string;
  userName: string;
  userGender?: ReturnType<typeof inferUserGenderFromName>;
  onSelectSuggestedReply: (reply: string) => void;
  onRegenerateTravelGuide?: (form: AiGuidePlanFormValues) => void;
  onBuddyPostFromTravelGuide?: (form: AiGuidePlanFormValues) => void;
  onRunCapability: (capability: AiCapability) => void;
  onOpenPersonalityTest: () => void;
};

const AiAssistantChatMessages = memo(function AiAssistantChatMessages({
  scrollRemeasureKey,
  sheetOverlayOpen,
  messages,
  isStreaming,
  isTravelGuideGenerating,
  keyboardInset,
  forceScrollToBottomKey,
  isLoadingHistory,
  hasMoreHistory,
  loadOlderMessages,
  activityLegacyId,
  userAvatar,
  userName,
  userGender,
  onSelectSuggestedReply,
  onRegenerateTravelGuide,
  onBuddyPostFromTravelGuide,
  onRunCapability,
  onOpenPersonalityTest,
}: AiAssistantChatMessagesProps) {
  const scrollAreaHeight = useAiChatScrollAreaHeight(scrollRemeasureKey, {
    enabled: !sheetOverlayOpen,
  });

  return (
    <View id={AI_CHAT_SCROLL_HOST_ID} className="s-ai-assistant-chat__scroll-host">
      <ChatMessageList
        messages={messages}
        isStreaming={isStreaming}
        isTravelGuideGenerating={isTravelGuideGenerating}
        scrollAreaHeight={scrollAreaHeight}
        reserveComposerSpace={isWeappRuntime}
        keyboardInset={keyboardInset}
        forceScrollToBottomKey={forceScrollToBottomKey}
        isLoadingHistory={isLoadingHistory}
        hasMoreHistory={hasMoreHistory}
        onLoadOlderMessages={loadOlderMessages}
        activityLegacyId={activityLegacyId}
        userAvatar={userAvatar}
        userName={userName}
        userGender={userGender}
        onSelectSuggestedReply={onSelectSuggestedReply}
        onRegenerateTravelGuide={onRegenerateTravelGuide}
        onBuddyPostFromTravelGuide={onBuddyPostFromTravelGuide}
        onRunCapability={onRunCapability}
        onOpenPersonalityTest={onOpenPersonalityTest}
      />
    </View>
  );
});

export function AiAssistantChat({
  layoutRemeasureKey = 0,
  onChatChromeLayoutChange,
  userGender,
  ...orchestratorOptions
}: AiAssistantChatProps) {
  const {
    keyboardInset,
    activityQuery,
    accountRisk,
    confirmDialog,
    guideEventCity,
    messages,
    isStreaming,
    isLoadingHistory,
    hasMoreHistory,
    loadOlderMessages,
    forceScrollToBottomKey,
    composer,
    capabilities,
    activityBinding,
  } = useAiAssistantOrchestrator(orchestratorOptions);

  const { buddyPost, travelGuide, composerBusy } = capabilities;
  const {
    sheetOpen: travelGuideSheetOpen,
    setSheetOpen: setTravelGuideSheetOpen,
    defaultNights: travelGuideDefaultNights,
    sheetInitialValues: travelGuideSheetInitialValues,
    handleSheetSubmit: handleTravelGuideSheetSubmit,
  } = travelGuide;
  const { activityLegacyId, activityTitle, userAvatar, userName, pageShowSeq } =
    orchestratorOptions;

  const scrollRemeasureKey = `${pageShowSeq ?? 0}:${layoutRemeasureKey}:${accountRisk?.status ?? 'normal'}`;
  const sheetOverlayOpen = travelGuideSheetOpen || buddyPost.sheetOpen;
  const chatKeyboardInset = sheetOverlayOpen ? 0 : keyboardInset;
  const closeTravelGuideSheet = useCallback(() => {
    setTravelGuideSheetOpen(false);
  }, [setTravelGuideSheetOpen]);
  const handleRunCapability = useCallback(
    (capability: AiCapability) => {
      capabilities.capabilityRunner.runCapability(capability, { source: 'chat' });
    },
    [capabilities.capabilityRunner],
  );

  return (
    <View
      className={cn(
        's-ai-assistant-chat',
        isWeappRuntime && 's-ai-assistant-chat--weapp-fixed-composer',
      )}
    >
      <AccountRiskBanner
        accountRisk={accountRisk}
        className="s-account-risk-banner--chat"
      />
      <AiAssistantChatCollapse
        activityLegacyId={activityLegacyId}
        onLayoutChange={onChatChromeLayoutChange}
      >
        <AiAssistantChatMessages
          scrollRemeasureKey={scrollRemeasureKey}
          sheetOverlayOpen={sheetOverlayOpen}
          messages={messages}
          isStreaming={isStreaming}
          isTravelGuideGenerating={travelGuide.isGenerating || buddyPost.isPublishing}
          keyboardInset={chatKeyboardInset}
          forceScrollToBottomKey={forceScrollToBottomKey}
          isLoadingHistory={isLoadingHistory}
          hasMoreHistory={hasMoreHistory}
          loadOlderMessages={loadOlderMessages}
          activityLegacyId={activityLegacyId}
          userAvatar={userAvatar}
          userName={userName}
          userGender={userGender}
          onSelectSuggestedReply={composer.handleSelectSuggestedReply}
          onRegenerateTravelGuide={travelGuide.handleRegenerate}
          onBuddyPostFromTravelGuide={buddyPost.openBuddyPostSheetFromTravelGuide}
          onRunCapability={handleRunCapability}
          onOpenPersonalityTest={capabilities.handleOpenPersonalityTest}
        />
      </AiAssistantChatCollapse>

      <AiAssistantChatFooter
        activityLegacyId={activityLegacyId}
        activityTitle={activityTitle}
        composerResetKey={composer.composerResetKey}
        composerBusy={composerBusy}
        keyboardInset={chatKeyboardInset}
        onSubmit={composer.submit}
        onClearChat={composer.handleClearChat}
      />

      {buddyPost.sheetOpen ? (
        <AiBuddyPostSheet
          open
          activityDate={activityQuery.data?.date}
          activityTitle={activityTitle}
          eventCity={guideEventCity}
          initialValues={buddyPost.sheetInitialValues}
          prefillSummaryLines={buddyPost.sheetPrefillHint}
          postQuota={
            buddyPost.sheetPostQuota
              ? {
                  used: buddyPost.sheetPostQuota.used,
                  max: buddyPost.sheetPostQuota.max,
                  remaining:
                    buddyPost.sheetPostQuota.max - buddyPost.sheetPostQuota.used,
                  atLimit:
                    buddyPost.sheetPostQuota.used >= buddyPost.sheetPostQuota.max,
                }
              : undefined
          }
          onClose={buddyPost.closeBuddyPostSheet}
          onSubmit={buddyPost.handleSheetSubmit}
        />
      ) : null}

      <AiGuidePlanSheet
        open={travelGuideSheetOpen}
        defaultNights={travelGuideDefaultNights}
        eventCity={guideEventCity}
        initialValues={travelGuideSheetInitialValues}
        onClose={closeTravelGuideSheet}
        onSubmit={handleTravelGuideSheetSubmit}
      />

      {activityBinding.activityPickerOpen ? (
        <AiActivityPickerSheet
          open
          onClose={activityBinding.closeActivityPicker}
          onSelect={activityBinding.handleActivityPicked}
        />
      ) : null}

      {confirmDialog}
      {buddyPost.complianceConfirmDialog}
    </View>
  );
}
