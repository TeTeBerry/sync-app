import { useCallback, useMemo, useRef } from 'react';
import type { ChatUiMessage } from '../../types/aiChat';
import type { AiGuidePlanFormValues } from '../../types/travelGuide';
import type { AuthorGender } from '../../utils/inferAuthorGender';
import type { AiCapability } from '@/domains/ai-capability';
import { useChatMessageWindow } from '../../hooks/ai-chat/useChatMessageWindow';
import { useChatScrollController } from '../../hooks/ai-chat/useChatScrollController';
import { ChatMessageRow } from './ChatMessageRow';
import { CHAT_SCROLL_BOTTOM_ID } from './chatScrollBottom';
import { shouldSuppressAutoScrollForMessage } from './chatMessageListScroll';
import { ScrollView, Text, View } from '@tarojs/components';

export function ChatMessageList({
  messages,
  isStreaming,
  isTravelGuideGenerating = false,
  scrollAreaHeight,
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
    suppressAutoScroll,
    contentRevision: `${scrollAnchorKey}:${isStreaming}:${isTravelGuideGenerating}`,
  });

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

  const showHistoryHint = isLoadingHistory || hasHiddenMessages || hasMoreHistory;

  return (
    <ScrollView
      scrollY
      enhanced
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
      <View className="s-ai-assistant-chat__scroll-inner">
        {showHistoryHint ? (
          <Text className="s-ai-assistant-chat__history-hint">
            {isLoadingHistory
              ? '加载更早消息…'
              : hasHiddenMessages
                ? `上滑查看更早的 ${hiddenCount} 条消息`
                : '上滑加载更早消息'}
          </Text>
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
}
