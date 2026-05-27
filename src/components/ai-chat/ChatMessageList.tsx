import React, { useCallback, useEffect, useLayoutEffect, useRef, useState } from "react";
import { useTranslation } from "react-i18next";
import { SparklesIcon } from "lucide-react";
import { cn } from "../ui";
import type { ChatUiMessage } from "../../types/aiChat";
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
  onSelectSuggestedReply,
}: {
  messages: ChatUiMessage[];
  isStreaming: boolean;
  userAvatar?: string;
  userName: string;
  onOpenImagePreview: (src: string) => void;
  onSelectSuggestedReply: (reply: string) => void;
}) {
  const { t } = useTranslation();
  const scrollRef = useRef<HTMLDivElement>(null);
  const bottomRef = useRef<HTMLDivElement>(null);
  const [stickToBottom, setStickToBottom] = useState(true);
  const prevMessageCountRef = useRef(messages.length);
  const prevLastFromRef = useRef<"ai" | "user" | undefined>(
    messages[messages.length - 1]?.from,
  );

  const scrollToBottom = useCallback((behavior: ScrollBehavior = "auto") => {
    const el = scrollRef.current;
    if (!el) return;
    el.scrollTo({ top: el.scrollHeight, behavior });
  }, []);

  useEffect(() => {
    const root = scrollRef.current;
    const sentinel = bottomRef.current;
    if (!root || !sentinel) return;

    const observer = new IntersectionObserver(
      ([entry]) => {
        setStickToBottom(entry.isIntersecting);
      },
      {
        root,
        threshold: 0,
        rootMargin: "0px 0px 64px 0px",
      },
    );

    observer.observe(sentinel);
    return () => observer.disconnect();
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
      scrollToBottom("smooth");
      return;
    }

    if (!stickToBottom) return;

    scrollToBottom("auto");
  }, [messages, stickToBottom, isStreaming, scrollToBottom]);

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
    <div ref={scrollRef} className="s-ai-assistant-chat__scroll">
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
