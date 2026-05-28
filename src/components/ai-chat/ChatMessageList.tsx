import React, { useCallback, useLayoutEffect, useState } from "react";
import { Sparkles } from "lucide-react-taro";
import { cn } from "../ui";
import type { ChatUiMessage } from "../../types/aiChat";
import { ChatUserAvatar } from "./ChatUserAvatar";
import { RecommendPostCards } from "./RecommendPostCards";
import { SuggestedReplyChips } from "./SuggestedReplyChips";
import { openSingleImagePreview } from "../../utils/openImagePreview";
import { Button, Image, ScrollView, Text, View } from "@tarojs/components";

function formatMessageTime(id: string): string | null {
  const ts = Number(id.split("-")[0]);
  if (!Number.isFinite(ts) || ts <= 0) return null;
  const date = new Date(ts);
  return date.toLocaleTimeString([], {
    hour: "2-digit",
    minute: "2-digit",
    hour12: false,
  });
}

export function ChatMessageList({
  messages,
  isStreaming,
  userAvatar,
  userName,
  onSelectSuggestedReply,
}: {
  messages: ChatUiMessage[];
  isStreaming: boolean;
  userAvatar?: string;
  userName: string;
  onSelectSuggestedReply: (reply: string) => void;
}) {
  const [scrollIntoView, setScrollIntoView] = useState<string | undefined>();

  const scrollToBottom = useCallback(() => {
    const last = messages[messages.length - 1];
    if (!last) return;
    const targetId = `chat-msg-${last.id}`;
    setScrollIntoView(undefined);
    setTimeout(() => setScrollIntoView(targetId), 0);
  }, [messages]);

  useLayoutEffect(() => {
    scrollToBottom();
  }, [messages, isStreaming, scrollToBottom]);

  const showTimestampForIndex = useCallback(
    (index: number) => {
      if (index === 0) return true;
      const current = messages[index];
      const previous = messages[index - 1];
      return current.from !== previous.from;
    },
    [messages],
  );

  return (
    <ScrollView
      scrollY
      enhanced
      showScrollbar={false}
      scrollIntoView={scrollIntoView}
      scrollWithAnimation
      className="s-ai-assistant-chat__scroll s-scrollbar-none">
      <View className="s-ai-assistant-chat__scroll-inner">
        {messages.map((msg, index) => {
          const isUser = msg.from === "user";
          const timestamp = formatMessageTime(msg.id);

          return (
            <React.Fragment key={msg.id}>
              {showTimestampForIndex(index) && timestamp ? (
                <Text className="s-ai-assistant-chat__timestamp">{timestamp}</Text>
              ) : null}
              <View
                id={`chat-msg-${msg.id}`}
                className={cn(
                  "s-ai-assistant-chat__row",
                  isUser && "s-ai-assistant-chat__row--from-user",
                )}>
                {!isUser ? (
                  <View className="s-ai-assistant-chat__avatar s-ai-assistant-chat__avatar--ai">
                    <Sparkles size={14} />
                  </View>
                ) : null}
                <View
                  className={cn(
                    "s-ai-assistant-chat__content",
                    isUser && "s-ai-assistant-chat__content--from-user",
                  )}>
                  <View
                    className={cn(
                      "s-ai-assistant-chat__bubble",
                      isUser
                        ? "s-ai-assistant-chat__bubble--from-user"
                        : "s-ai-assistant-chat__bubble--from-ai",
                      msg.streaming && "s-ai-assistant-chat__bubble--streaming",
                      msg.streaming && !msg.text && "s-ai-assistant-chat__bubble--waiting",
                    )}>
                    {msg.streaming && !msg.text ? (
                      <View
                        className="s-ai-assistant-chat__typing"
                        aria-label="AI 正在思考">
                        <View className="s-ai-assistant-chat__typing-dot" />
                        <View className="s-ai-assistant-chat__typing-dot" />
                        <View className="s-ai-assistant-chat__typing-dot" />
                      </View>
                    ) : (
                      <>
                        {msg.imagePreview ? (
                          <Button className="s-ai-assistant-chat__bubble-image-btn"
                            aria-label="查看大图"
                            onClick={() => openSingleImagePreview(msg.imagePreview!)}>
                            <Image
                              className="s-ai-assistant-chat__bubble-image"
                              src={msg.imagePreview}
                              alt="已上传的图片"
                            />
                          </Button>
                        ) : null}
                        {msg.text ? <Text>{msg.text}</Text> : null}
                        {msg.createdPost ? (
                          <RecommendPostCards
                            posts={[msg.createdPost]}
                            variant="created"
                          />
                        ) : null}
                        {msg.recommendedPosts?.length ? (
                          <RecommendPostCards posts={msg.recommendedPosts} />
                        ) : null}
                        {msg.suggestedReplies?.length ? (
                          <SuggestedReplyChips
                            replies={msg.suggestedReplies}
                            disabled={isStreaming}
                            onSelect={onSelectSuggestedReply}
                          />
                        ) : null}
                      </>
                    )}
                  </View>
                </View>
                {isUser ? <ChatUserAvatar avatar={userAvatar} name={userName} /> : null}
              </View>
            </React.Fragment>
          );
        })}
      </View>
    </ScrollView>
  );
}
