import { memo, useCallback, useEffect, useMemo, useRef } from 'react';
import type { ChatUiMessage } from '../../types/aiChat';
import type { AiGuidePlanFormValues } from '../../types/travelGuide';
import type { AuthorGender } from '../../utils/inferAuthorGender';
import type { AiCapability } from '@/domains/ai-capability';
import { useChatMessageWindow } from '../../hooks/ai-chat/useChatMessageWindow';
import { useChatScrollController } from '../../hooks/ai-chat/useChatScrollController';
import { ChatMessageRow } from './ChatMessageRow';
import { ChatHistoryHint } from './ChatHistoryHint';
import { CHAT_SCROLL_BOTTOM_ID } from './chatScrollBottom';
import { shouldSuppressAutoScrollForMessage } from './chatMessageListScroll';
import { isWeappRuntime } from '@/pages/ai/assistant/aiChatLayout.util';
import { useChatCollapseExpanded } from '@/pages/ai/components/chatCollapseExpandedContext';
import { ScrollView, View } from '@tarojs/components';

export const ChatMessageList = memo(function ChatMessageList({
  messages,
  isStreaming,
  isTravelGuideGenerating = false,
  scrollAreaHeight,
  reserveComposerSpace = false,
  keyboardInset = 0,
  forceScrollToBottomKey = 0,
  isLoadingHistory = false,
  hasMoreHistory = false,
  onLoadOlderMessages,
  activityLegacyId,
  userAvatar,
  userName,
  userGender,
  onSelectSuggestedReply,
  onRegenerateTravelGuide,
  onBuddyPostFromTravelGuide,
  onRunCapability,
  onOpenPersonalityTest,
}: {
  messages: ChatUiMessage[];
  isStreaming: boolean;
  isTravelGuideGenerating?: boolean;
  scrollAreaHeight?: number;
  reserveComposerSpace?: boolean;
  keyboardInset?: number;
  forceScrollToBottomKey?: number;
  isLoadingHistory?: boolean;
  hasMoreHistory?: boolean;
  onLoadOlderMessages?: () => Promise<number>;
  activityLegacyId?: number;
  userAvatar?: string;
  userName: string;
  userGender?: AuthorGender;
  onSelectSuggestedReply: (reply: string) => void;
  onRegenerateTravelGuide?: (form: AiGuidePlanFormValues) => void;
  onBuddyPostFromTravelGuide?: (form: AiGuidePlanFormValues) => void;
  onRunCapability?: (capability: AiCapability) => void;
  onOpenPersonalityTest?: () => void;
}) {
  const loadingHistoryRef = useRef(false);
  const chatExpanded = useChatCollapseExpanded();
  const previewCollapsed = !chatExpanded;
  const {
    visibleMessages,
    hiddenCount,
    hasHiddenMessages,
    expandWindow,
    expandWindowBy,
  } = useChatMessageWindow(messages);

  const lastMessage = messages[messages.length - 1];
  const scrollAnchorKey = useMemo(() => {
    if (!lastMessage) return '0';
    const streamLen = lastMessage.streaming ? (lastMessage.text?.length ?? 0) : 0;
    const guide = lastMessage.travelGuide ? 'guide' : '';
    return `${messages.length}:${lastMessage.id}:${streamLen}:${guide}:${keyboardInset}`;
  }, [keyboardInset, lastMessage, messages.length]);

  const suppressAutoScroll = shouldSuppressAutoScrollForMessage(lastMessage);

  const scroll = useChatScrollController({
    messageCount: messages.length,
    bottomAnchorId: CHAT_SCROLL_BOTTOM_ID,
    forceScrollToBottomKey,
    suppressAutoScroll: previewCollapsed || suppressAutoScroll,
    contentRevision: `${scrollAnchorKey}:${isStreaming}:${isTravelGuideGenerating}`,
  });

  const { scrollToTop } = scroll;

  useEffect(() => {
    if (!previewCollapsed) return;
    scrollToTop();
  }, [previewCollapsed, scrollAnchorKey, scrollToTop]);

  const handleScroll = useCallback(
    (event: {
      detail: { scrollTop: number; scrollHeight: number; clientHeight?: number };
    }) => {
      scroll.handleScroll(event.detail);
    },
    [scroll],
  );

  const handleScrollToUpper = useCallback(async () => {
    if (isLoadingHistory || loadingHistoryRef.current) return;

    if (hasHiddenMessages) {
      expandWindow();
      return;
    }

    if (!hasMoreHistory || !onLoadOlderMessages) return;

    loadingHistoryRef.current = true;
    try {
      const loadedCount = await onLoadOlderMessages();
      if (loadedCount) {
        expandWindowBy(loadedCount);
      }
    } finally {
      loadingHistoryRef.current = false;
    }
  }, [
    expandWindow,
    expandWindowBy,
    hasHiddenMessages,
    hasMoreHistory,
    isLoadingHistory,
    onLoadOlderMessages,
  ]);

  const handleHistoryHintPress = useCallback(() => {
    void handleScrollToUpper();
  }, [handleScrollToUpper]);

  const showHistoryHint = isLoadingHistory || hasHiddenMessages || hasMoreHistory;

  return (
    <ScrollView
      scrollY
      enhanced={!isWeappRuntime}
      showScrollbar={false}
      scrollTop={scroll.scrollTop}
      scrollIntoView={scroll.scrollIntoView}
      scrollWithAnimation={false}
      upperThreshold={80}
      onScroll={handleScroll}
      onScrollToUpper={handleScrollToUpper}
      className="s-ai-assistant-chat__scroll s-scrollbar-none"
      style={scrollAreaHeight != null ? { height: `${scrollAreaHeight}px` } : undefined}
    >
      <View
        className={[
          's-ai-assistant-chat__scroll-inner',
          reserveComposerSpace && 's-ai-assistant-chat__scroll-inner--composer-fixed',
        ]
          .filter(Boolean)
          .join(' ')}
      >
        {showHistoryHint ? (
          <ChatHistoryHint
            loading={isLoadingHistory}
            hiddenCount={hiddenCount}
            hasHiddenMessages={hasHiddenMessages}
            hasMoreHistory={hasMoreHistory}
            onPress={handleHistoryHintPress}
          />
        ) : null}
        {visibleMessages.map((msg, index) => (
          <ChatMessageRow
            key={msg.id}
            msg={msg}
            prevMsg={index > 0 ? visibleMessages[index - 1] : undefined}
            isStreaming={isStreaming}
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
        ))}
        <View
          id={CHAT_SCROLL_BOTTOM_ID}
          className="s-ai-assistant-chat__scroll-bottom"
        />
      </View>
    </ScrollView>
  );
});
