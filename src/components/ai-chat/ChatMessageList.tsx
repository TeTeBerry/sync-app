import { useCallback, useLayoutEffect, useMemo, useState } from 'react';
import type { ChatUiMessage } from '../../types/aiChat';
import type { AiGuidePlanFormValues } from '../../types/travelGuide';
import type { AuthorGender } from '../../utils/inferAuthorGender';
import { throttleRaf } from '../../utils/throttleRaf';
import { ChatMessageRow } from './ChatMessageRow';
import { AiMatchQuotaExhaustedMessage } from './AiMatchQuotaExhaustedMessage';
import { ScrollView, View } from '@tarojs/components';

export function ChatMessageList({
  messages,
  isStreaming,
  keyboardInset = 0,
  userAvatar,
  userName,
  userGender,
  onSelectSuggestedReply,
  onRegenerateTravelGuide,
  onShareTravelGuide,
}: {
  messages: ChatUiMessage[];
  isStreaming: boolean;
  keyboardInset?: number;
  userAvatar?: string;
  userName: string;
  userGender?: AuthorGender;
  onSelectSuggestedReply: (reply: string) => void;
  onRegenerateTravelGuide?: (form: AiGuidePlanFormValues) => void;
  onShareTravelGuide?: (imagePath: string) => void;
}) {
  const [scrollIntoView, setScrollIntoView] = useState<string | undefined>();

  const lastMessage = messages[messages.length - 1];
  const scrollAnchorKey = useMemo(() => {
    if (!lastMessage) return '0';
    const streamLen = lastMessage.streaming ? (lastMessage.text?.length ?? 0) : 0;
    return `${messages.length}:${lastMessage.id}:${streamLen}`;
  }, [messages.length, lastMessage]);

  const scrollToBottom = useCallback(() => {
    if (!lastMessage) return;
    const targetId = `chat-msg-${lastMessage.id}`;
    setScrollIntoView(undefined);
    setTimeout(() => setScrollIntoView(targetId), 0);
  }, [lastMessage]);

  const scrollToBottomThrottled = useMemo(
    () => throttleRaf(scrollToBottom),
    [scrollToBottom],
  );

  useLayoutEffect(() => {
    scrollToBottomThrottled();
  }, [scrollAnchorKey, isStreaming, keyboardInset, scrollToBottomThrottled]);

  return (
    <ScrollView
      scrollY
      enhanced
      showScrollbar={false}
      scrollIntoView={scrollIntoView}
      scrollWithAnimation
      className="s-ai-assistant-chat__scroll s-scrollbar-none"
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
            onShareTravelGuide={onShareTravelGuide}
          />
        ))}
        <AiMatchQuotaExhaustedMessage />
      </View>
    </ScrollView>
  );
}
