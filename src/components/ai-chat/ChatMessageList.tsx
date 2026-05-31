import React, { useCallback, useLayoutEffect, useState } from "react";
import { Sparkles } from "lucide-react-taro";
import { cn } from "../ui";
import type { ChatUiMessage } from "../../types/aiChat";
import type { AuthorGender } from "../../utils/inferAuthorGender";
import { ChatUserAvatar } from "./ChatUserAvatar";
import { AiAssistantActivityCard } from "./AiAssistantActivityCard";
import { RecommendPostCards } from "./RecommendPostCards";
import { PublishConfirmCard } from "./PublishConfirmCard";
import { SuggestedReplyChips } from "./SuggestedReplyChips";
import { AiMatchQuotaExhaustedMessage } from "./AiMatchQuotaExhaustedMessage";
import { parsePublishConfirmMessage } from "../../utils/parsePublishConfirmMessage";
import { openSingleImagePreview } from "../../utils/openImagePreview";
import { Button, Image, ScrollView, Text, View } from "@tarojs/components";

const TIMESTAMP_GAP_MS = 5 * 60 * 1000;

function messageTimestampMs(id: string): number | null {
  const ts = Number(id.split("-")[0]);
  if (!Number.isFinite(ts) || ts <= 0) return null;
  return ts;
}

function formatMessageTime(id: string): string | null {
  const ts = messageTimestampMs(id);
  if (ts == null) return null;
  const date = new Date(ts);
  return date.toLocaleTimeString([], {
    hour: "2-digit",
    minute: "2-digit",
    hour12: false,
  });
}

function shouldShowTimestamp(messages: ChatUiMessage[], index: number): boolean {
  if (index === 0) return true;
  const currentTs = messageTimestampMs(messages[index].id);
  const previousTs = messageTimestampMs(messages[index - 1].id);
  if (currentTs == null || previousTs == null) {
    return messages[index].from !== messages[index - 1].from;
  }
  return currentTs - previousTs >= TIMESTAMP_GAP_MS;
}

export function ChatMessageList({
  messages,
  isStreaming,
  keyboardInset = 0,
  userAvatar,
  userName,
  userGender,
  onSelectSuggestedReply,
}: {
  messages: ChatUiMessage[];
  isStreaming: boolean;
  keyboardInset?: number;
  userAvatar?: string;
  userName: string;
  userGender?: AuthorGender;
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
  }, [messages, isStreaming, keyboardInset, scrollToBottom]);

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
        {messages.map((msg, index) => {
          const isUser = msg.from === "user";
          const timestamp = formatMessageTime(msg.id);

          const publishConfirm =
            !isUser && !msg.streaming ? parsePublishConfirmMessage(msg.text) : null;
          const hasPostCards = Boolean(msg.createdPost || msg.recommendedPosts?.length);
          const hasActivityCard = Boolean(msg.recommendedActivity);
          const hasSuggestedReplies = Boolean(msg.suggestedReplies?.length);
          const showEmbedBelow =
            !isUser && (hasPostCards || hasActivityCard || hasSuggestedReplies);
          const showPublishConfirm = Boolean(publishConfirm);

          return (
            <React.Fragment key={msg.id}>
              {shouldShowTimestamp(messages, index) && timestamp ? (
                <Text className="s-ai-assistant-chat__timestamp">{timestamp}</Text>
              ) : null}
              <View
                id={`chat-msg-${msg.id}`}
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
                    (hasPostCards || hasActivityCard || showPublishConfirm) &&
                      "s-ai-assistant-chat__content--has-cards",
                  )}
                >
                  <View
                    className={cn(
                      "s-ai-assistant-chat__bubble",
                      isUser
                        ? cn(
                            "s-ai-assistant-chat__bubble--from-user",
                            userGender === "female" &&
                              "s-ai-assistant-chat__bubble--from-user--female",
                            userGender === "male" && "s-ai-assistant-chat__bubble--from-user--male",
                          )
                        : "s-ai-assistant-chat__bubble--from-ai",
                      msg.streaming && "s-ai-assistant-chat__bubble--streaming",
                      msg.streaming && !msg.text && "s-ai-assistant-chat__bubble--waiting",
                      showEmbedBelow && "s-ai-assistant-chat__bubble--with-embed-below",
                      showPublishConfirm && "s-ai-assistant-chat__bubble--publish-confirm",
                    )}
                  >
                    {msg.streaming && !msg.text ? (
                      <View className="s-ai-assistant-chat__typing" aria-label="AI 正在思考">
                        <View className="s-ai-assistant-chat__typing-dot" />
                        <View className="s-ai-assistant-chat__typing-dot" />
                        <View className="s-ai-assistant-chat__typing-dot" />
                      </View>
                    ) : (
                      <>
                        {msg.imagePreview ? (
                          <Button
                            className="s-ai-assistant-chat__bubble-image-btn"
                            aria-label="查看大图"
                            onClick={() => openSingleImagePreview(msg.imagePreview!)}
                          >
                            <Image
                              className="s-ai-assistant-chat__bubble-image"
                              src={msg.imagePreview}
                              alt="已上传的图片"
                            />
                          </Button>
                        ) : null}
                        {publishConfirm ? (
                          <PublishConfirmCard
                            payload={publishConfirm}
                            userAvatar={userAvatar}
                            userName={userName}
                          />
                        ) : msg.text ? (
                          <Text className="s-ai-assistant-chat__bubble-text">{msg.text}</Text>
                        ) : null}
                        {isUser && hasSuggestedReplies ? (
                          <SuggestedReplyChips
                            replies={msg.suggestedReplies}
                            disabled={isStreaming}
                            onSelect={onSelectSuggestedReply}
                          />
                        ) : null}
                      </>
                    )}
                  </View>
                  {showEmbedBelow ? (
                    <View className="s-ai-assistant-chat__embed">
                      {msg.recommendedActivity ? (
                        <AiAssistantActivityCard activity={msg.recommendedActivity} />
                      ) : null}
                      {msg.createdPost ? (
                        <RecommendPostCards posts={[msg.createdPost]} variant="created" />
                      ) : null}
                      {msg.recommendedPosts?.length ? (
                        <RecommendPostCards posts={msg.recommendedPosts} />
                      ) : null}
                      {hasSuggestedReplies ? (
                        <SuggestedReplyChips
                          replies={msg.suggestedReplies}
                          disabled={isStreaming}
                          onSelect={onSelectSuggestedReply}
                        />
                      ) : null}
                    </View>
                  ) : null}
                </View>
                {isUser ? (
                  <ChatUserAvatar avatar={userAvatar} name={userName} userGender={userGender} />
                ) : null}
              </View>
            </React.Fragment>
          );
        })}
        <AiMatchQuotaExhaustedMessage />
      </View>
    </ScrollView>
  );
}
