import React, { useCallback, useEffect, useRef } from "react";
import { useTranslation } from "react-i18next";
import { SparklesIcon } from "lucide-react";
import { Button, cn } from "../ui";
import type { BuddyCopyVariant, ChatUiMessage } from "../../types/aiChat";
import { ChatUserAvatar } from "./ChatUserAvatar";
import { RecommendPostCards } from "./RecommendPostCards";
import { SuggestedReplyChips } from "./SuggestedReplyChips";

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
  onSelectCopyVariant,
  onSelectSuggestedReply,
}: {
  messages: ChatUiMessage[];
  isStreaming: boolean;
  userAvatar?: string;
  userName: string;
  onOpenImagePreview: (src: string) => void;
  onSelectCopyVariant: (label: string) => void;
  onSelectSuggestedReply: (reply: string) => void;
}) {
  const { t } = useTranslation();
  const bottomRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

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
    <div className="s-ai-assistant-chat__scroll">
      {messages.map((msg, index) => {
        const isUser = msg.from === "user";
        const timestamp = formatMessageTime(msg.id);

        return (
          <React.Fragment key={msg.id}>
            {showTimestampForIndex(index) && timestamp ? (
              <p className="s-ai-assistant-chat__timestamp">{timestamp}</p>
            ) : null}
            <div
              className={cn(
                "s-ai-assistant-chat__row",
                isUser && "s-ai-assistant-chat__row--from-user",
              )}
            >
              {!isUser ? (
                <div className="s-ai-assistant-chat__avatar s-ai-assistant-chat__avatar--ai">
                  <SparklesIcon size={14} />
                </div>
              ) : null}
              <div
                className={cn(
                  "s-ai-assistant-chat__content",
                  isUser && "s-ai-assistant-chat__content--from-user",
                )}
              >
                <div
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
                    <span
                      className="s-ai-assistant-chat__typing"
                      aria-label={t("aiAssistant.chat.thinking")}
                    >
                      <span />
                      <span />
                      <span />
                    </span>
                  ) : (
                    <>
                      {msg.imagePreview ? (
                        <button
                          type="button"
                          className="s-ai-assistant-chat__bubble-image-btn"
                          aria-label={t("aiAssistant.chat.viewImage")}
                          onClick={() => onOpenImagePreview(msg.imagePreview!)}
                        >
                          <img
                            className="s-ai-assistant-chat__bubble-image"
                            src={msg.imagePreview}
                            alt={t("aiAssistant.chat.uploadedImageAlt")}
                          />
                        </button>
                      ) : null}
                      {msg.text ? <span>{msg.text}</span> : null}
                      {msg.recommendedPosts?.length ? (
                        <RecommendPostCards posts={msg.recommendedPosts} />
                      ) : null}
                      {msg.copyVariants?.length ? (
                        <CopyVariantChips
                          variants={msg.copyVariants}
                          disabled={isStreaming}
                          onSelect={onSelectCopyVariant}
                        />
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
                </div>
              </div>
              {isUser ? <ChatUserAvatar avatar={userAvatar} name={userName} /> : null}
            </div>
          </React.Fragment>
        );
      })}
      <div ref={bottomRef} />
    </div>
  );
}

function CopyVariantChips({
  variants,
  disabled,
  onSelect,
}: {
  variants: BuddyCopyVariant[];
  disabled?: boolean;
  onSelect: (label: string) => void;
}) {
  return (
    <div className="s-ai-assistant-chat__copy-row">
      {variants.map((variant) => (
        <Button
          key={variant.style}
          className="s-ai-assistant-chat__copy-chip"
          disabled={disabled}
          onClick={() => onSelect(variant.label)}
        >
          {variant.label}
        </Button>
      ))}
    </div>
  );
}
