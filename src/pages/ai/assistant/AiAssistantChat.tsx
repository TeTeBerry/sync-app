import React from 'react';
import { ChatMessageList } from '../../../components/ai-chat/ChatMessageList';
import { ChatComposer } from '../../../components/ai-chat/ChatComposer';
import { AccountRiskBanner } from '../../../components/account-risk/AccountRiskBanner';
import { AiBuddyPostSheet } from '../../../components/ai-chat/AiBuddyPostSheet';
import { AiActivityPickerSheet } from '../../../components/ai-chat/AiActivityPickerSheet';
import { AiGuidePlanSheet } from '../../../components/ai-chat/AiGuidePlanSheet';
import type { inferUserGenderFromName } from '../../../utils/inferAuthorGender';
import { View } from '@tarojs/components';
import {
  useAiAssistantOrchestrator,
  type UseAiAssistantOrchestratorOptions,
} from './hooks/useAiAssistantOrchestrator';
import {
  AI_CHAT_SCROLL_HOST_ID,
  useAiChatScrollAreaHeight,
} from './hooks/useAiChatScrollAreaHeight';

export type AiAssistantChatProps = UseAiAssistantOrchestratorOptions & {
  /** Bump when chrome above the chat column changes size (festival plan expand, etc.). */
  layoutRemeasureKey?: string | number;
  userGender?: ReturnType<typeof inferUserGenderFromName>;
};

export function AiAssistantChat({
  layoutRemeasureKey = 0,
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
  const { activityLegacyId, activityTitle, userAvatar, userName, pageShowSeq } =
    orchestratorOptions;

  const scrollRemeasureKey = `${pageShowSeq ?? 0}:${layoutRemeasureKey}:${accountRisk?.status ?? 'normal'}`;
  const scrollAreaHeight = useAiChatScrollAreaHeight(scrollRemeasureKey);

  return (
    <View className="s-ai-assistant-chat">
      <AccountRiskBanner
        accountRisk={accountRisk}
        className="s-account-risk-banner--chat"
      />
      <View id={AI_CHAT_SCROLL_HOST_ID} className="s-ai-assistant-chat__scroll-host">
        <ChatMessageList
          messages={messages}
          isStreaming={isStreaming}
          isTravelGuideGenerating={travelGuide.isGenerating || buddyPost.isPublishing}
          scrollAreaHeight={scrollAreaHeight}
          keyboardInset={keyboardInset}
          forceScrollToBottomKey={forceScrollToBottomKey}
          isLoadingHistory={isLoadingHistory}
          hasMoreHistory={hasMoreHistory}
          onLoadOlderMessages={loadOlderMessages}
          activityLegacyId={activityLegacyId}
          userAvatar={userAvatar}
          userName={userName}
          userGender={userGender}
          onSelectSuggestedReply={composer.handleSelectSuggestedReply}
          onRegenerateTravelGuide={travelGuide.handleRegenerate}
          onBuddyPostFromTravelGuide={buddyPost.openBuddyPostSheetFromTravelGuide}
          onRunCapability={(capability) =>
            capabilities.capabilityRunner.runCapability(capability, { source: 'chat' })
          }
          onOpenPersonalityTest={capabilities.handleOpenPersonalityTest}
        />
      </View>
      <View
        className="s-ai-assistant-chat__footer"
        style={keyboardInset > 0 ? { paddingBottom: `${keyboardInset}px` } : undefined}
      >
        <ChatComposer
          input={composer.input}
          isStreaming={composerBusy}
          isLoadingHistory={isLoadingHistory}
          activityLegacyId={activityLegacyId}
          activityTitle={activityTitle}
          onInputChange={composer.setInput}
          onSubmit={composer.submit}
          onClearChat={composer.handleClearChat}
          clearDisabled={composerBusy}
        />
      </View>

      {buddyPost.sheetOpen ? (
        <AiBuddyPostSheet
          open
          activityDate={activityQuery.data?.date}
          activityTitle={activityTitle}
          eventCity={guideEventCity}
          initialValues={buddyPost.sheetInitialValues}
          prefillSummaryLines={buddyPost.sheetPrefillHint}
          postQuota={buddyPost.sheetPostQuota ?? undefined}
          onClose={buddyPost.closeBuddyPostSheet}
          onSubmit={buddyPost.handleSheetSubmit}
        />
      ) : null}

      {travelGuide.sheetOpen ? (
        <AiGuidePlanSheet
          open
          defaultNights={travelGuide.defaultNights}
          eventCity={guideEventCity}
          initialValues={travelGuide.sheetInitialValues}
          onClose={() => travelGuide.setSheetOpen(false)}
          onSubmit={travelGuide.handleSheetSubmit}
        />
      ) : null}

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
