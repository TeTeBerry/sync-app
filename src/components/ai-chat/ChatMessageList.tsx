import { useCallback, useLayoutEffect, useMemo, useRef, useState } from 'react';
import type { ChatUiMessage } from '../../types/aiChat';
import type { AiGuidePlanFormValues } from '../../types/travelGuide';
import type { AuthorGender } from '../../utils/inferAuthorGender';
import { throttleRaf } from '../../utils/throttleRaf';
import { ChatMessageRow } from './ChatMessageRow';
import { CHAT_SCROLL_BOTTOM_ID } from './chatScrollBottom';
import { shouldSuppressAutoScrollForMessage } from './chatMessageListScroll';
import { ScrollView, View } from '@tarojs/components';

const SCROLL_TOP_STEP = 100_000;

export function ChatMessageList({
  messages,
  isStreaming,
  isTravelGuideGenerating = false,
  scrollAreaHeight,
  keyboardInset = 0,
  /** Bump when re-entering the page or after history sync — scrolls to latest messages. */
  forceScrollToBottomKey = 0,
  userAvatar,
  userName,
  userGender,
  onSelectSuggestedReply,
  onRegenerateTravelGuide,
  onBuddyPostFromTravelGuide,
  onOpenBuddyPostSheet,
  onOpenTravelGuideSheet,
}: {
  messages: ChatUiMessage[];
  isStreaming: boolean;
  isTravelGuideGenerating?: boolean;
  scrollAreaHeight?: number;
  keyboardInset?: number;
  forceScrollToBottomKey?: number;
  userAvatar?: string;
  userName: string;
  userGender?: AuthorGender;
  onSelectSuggestedReply: (reply: string) => void;
  onRegenerateTravelGuide?: (form: AiGuidePlanFormValues) => void;
  onBuddyPostFromTravelGuide?: (form: AiGuidePlanFormValues) => void;
  onOpenBuddyPostSheet?: () => void;
  onOpenTravelGuideSheet?: () => void;
}) {
  const [scrollIntoView, setScrollIntoView] = useState<string | undefined>();
  const [scrollTop, setScrollTop] = useState(0);
  const scrollTopRef = useRef(0);

  const lastMessage = messages[messages.length - 1];
  const scrollAnchorKey = useMemo(() => {
    if (!lastMessage) return '0';
    const streamLen = lastMessage.streaming ? (lastMessage.text?.length ?? 0) : 0;
    const guide = lastMessage.travelGuide ? 'guide' : '';
    return `${messages.length}:${lastMessage.id}:${streamLen}:${guide}`;
  }, [messages.length, lastMessage]);

  const scrollToBottom = useCallback(() => {
    if (messages.length === 0) return;
    scrollTopRef.current =
      scrollTopRef.current >= 5_000_000
        ? SCROLL_TOP_STEP
        : scrollTopRef.current + SCROLL_TOP_STEP;
    setScrollTop(scrollTopRef.current);
    setScrollIntoView(undefined);
    const apply = () => setScrollIntoView(CHAT_SCROLL_BOTTOM_ID);
    setTimeout(apply, 0);
    setTimeout(apply, 80);
    setTimeout(apply, 220);
    setTimeout(apply, 450);
  }, [messages.length]);

  const scrollToBottomThrottled = useMemo(
    () => throttleRaf(scrollToBottom),
    [scrollToBottom],
  );

  const suppressAutoScroll = shouldSuppressAutoScrollForMessage(lastMessage);

  useLayoutEffect(() => {
    if (suppressAutoScroll) return;
    scrollToBottomThrottled();
  }, [
    suppressAutoScroll,
    scrollAnchorKey,
    isStreaming,
    isTravelGuideGenerating,
    keyboardInset,
    scrollToBottomThrottled,
  ]);

  useLayoutEffect(() => {
    if (!forceScrollToBottomKey) return;
    if (suppressAutoScroll) return;
    scrollToBottom();
    const t1 = setTimeout(() => scrollToBottom(), 120);
    const t2 = setTimeout(() => scrollToBottom(), 320);
    const t3 = setTimeout(() => scrollToBottom(), 520);
    return () => {
      clearTimeout(t1);
      clearTimeout(t2);
      clearTimeout(t3);
    };
  }, [forceScrollToBottomKey, suppressAutoScroll, scrollToBottom]);

  return (
    <ScrollView
      scrollY
      enhanced
      showScrollbar={false}
      scrollTop={scrollTop}
      scrollIntoView={scrollIntoView}
      scrollWithAnimation={false}
      className="s-ai-assistant-chat__scroll s-scrollbar-none"
      style={scrollAreaHeight != null ? { height: `${scrollAreaHeight}px` } : undefined}
    >
      <View className="s-ai-assistant-chat__scroll-inner">
        {messages.map((msg, index) => (
          <ChatMessageRow
            key={msg.id}
            msg={msg}
            index={index}
            messages={messages}
            isStreaming={isStreaming}
            userAvatar={userAvatar}
            userName={userName}
            userGender={userGender}
            onSelectSuggestedReply={onSelectSuggestedReply}
            onRegenerateTravelGuide={onRegenerateTravelGuide}
            onBuddyPostFromTravelGuide={onBuddyPostFromTravelGuide}
            onOpenBuddyPostSheet={onOpenBuddyPostSheet}
            onOpenTravelGuideSheet={onOpenTravelGuideSheet}
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
