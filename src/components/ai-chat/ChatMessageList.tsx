import React, { useCallback, useLayoutEffect, useRef } from "react";
import { Sparkles } from "lucide-react-taro";
import { cn } from "../ui";
import type { ChatUiMessage } from "../../types/aiChat";
import { ChatUserAvatar } from "./ChatUserAvatar";
import { RecommendPostCards } from "./RecommendPostCards";
import { SuggestedReplyChips } from "./SuggestedReplyChips";
import { Button, Image, Text, View } from '@tarojs/components';

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
  onOpenImagePreview,
  onSelectSuggestedReply,
}: {
  messages: ChatUiMessage[];
  isStreaming: boolean;
  userAvatar?: string;
  userName: string;
  onOpenImagePreview: (src: string) => void;
  onSelectSuggestedReply: (reply: string) => void;
}) {
  const scrollRef = useRef<HTMLDivElement>(null);
  const prevMessageCountRef = useRef(messages.length);
  const prevLastFromRef = useRef<"ai" | "user" | undefined>(
    messages[messages.length - 1]?.from,
  );

  const scrollToBottom = useCallback(() => {
    const el = scrollRef.current;
    if (!el) return;
    el.scrollTop = el.scrollHeight;
  }, []);

  useLayoutEffect(() => {
    const prevCount = prevMessageCountRef.current;
    const last = messages[messages.length - 1];
    const prevLastFrom = prevLastFromRef.current;
    const newUserMessage =
      messages.length > prevCount && last?.from === "user";
    const userJustSent =
      last?.from === "user" && prevLastFrom !== "user";

    prevMessageCountRef.current = messages.length;
    prevLastFromRef.current = last?.from;

    if (newUserMessage || userJustSent) {
      scrollToBottom();
      return;
    }

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
    <View ref={scrollRef} className="s-ai-assistant-chat__scroll">
      {messages.map((msg, index) => {
        const isUser = msg.from === "user";
        const timestamp = formatMessageTime(msg.id);

        return (
          <React.Fragment key={msg.id}>
            {showTimestampForIndex(index) && timestamp ? (
              <Text className="s-ai-assistant-chat__timestamp">{timestamp}</Text>
            ) : null}
            <View
              className={cn(
                "s-ai-assistant-chat__row",
                isUser && "s-ai-assistant-chat__row--from-user",
              )}
            >
              {!isUser ? (
                <View className="s-ai-assistant-chat__avatar s-ai-assistant-chat__avatar--ai">
                  <Sparkles size={14} />
                </View>
              ) : null}
              <View
                className={cn(
                  "s-ai-assistant-chat__content",
                  isUser && "s-ai-assistant-chat__content--from-user",
                )}
              >
                <View
                  className={cn(
                    "s-ai-assistant-chat__bubble",
                    isUser
                      ? "s-ai-assistant-chat__bubble--from-user"
                      : "s-ai-assistant-chat__bubble--from-ai",
                    msg.streaming && "s-ai-assistant-chat__bubble--streaming",
                    msg.streaming && !msg.text && "s-ai-assistant-chat__bubble--waiting",
                  )}
                >
                  {msg.streaming && !msg.text ? (
                    <Text
                      className="s-ai-assistant-chat__typing"
                      aria-label="AI 正在思考"
                    >
                      <Text />
                      <Text />
                      <Text />
                    </Text>
                  ) : (
                    <>
                      {msg.imagePreview ? (
                        <Button
                          type="button"
                          className="s-ai-assistant-chat__bubble-image-btn"
                          aria-label="查看大图"
                          onClick={() => onOpenImagePreview(msg.imagePreview!)}
                        >
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
  );
}
