import { useCallback, useEffect, useRef, useState } from "react";
import { AI_CHAT_STREAM_URL } from "../constants/api";
import type { AiChatMessage, ChatUiMessage } from "../types/aiChat";
import { mockAiChatStream, streamAiChatRequest } from "../utils/aiChatStream";

function createMessageId() {
  return `${Date.now()}-${Math.random().toString(36).slice(2, 9)}`;
}

export interface UseAiChatStreamOptions {
  welcomeText: string;
  /** Used when `TARO_APP_AI_CHAT_URL` is unset */
  mockReply: (query: string) => string;
  streamErrorText: string;
  apiUrl?: string;
  getAuthHeaders?: () => Record<string, string>;
}

export function useAiChatStream(options: UseAiChatStreamOptions) {
  const {
    welcomeText,
    mockReply,
    streamErrorText,
    apiUrl = AI_CHAT_STREAM_URL,
    getAuthHeaders,
  } = options;

  const [messages, setMessages] = useState<ChatUiMessage[]>([]);
  const [isStreaming, setIsStreaming] = useState(false);
  const abortRef = useRef<AbortController | null>(null);
  const messagesRef = useRef<ChatUiMessage[]>(messages);

  useEffect(() => {
    messagesRef.current = messages;
  }, [messages]);

  useEffect(() => {
    return () => abortRef.current?.abort();
  }, []);

  const setWelcome = useCallback((text: string) => {
    setMessages([{ id: createMessageId(), from: "ai", text }]);
  }, []);

  useEffect(() => {
    setWelcome(welcomeText);
  }, [welcomeText, setWelcome]);

  const abort = useCallback(() => {
    abortRef.current?.abort();
  }, []);

  const send = useCallback(
    async (text: string) => {
      const trimmed = text.trim();
      if (!trimmed || isStreaming) return;

      const userMsg: ChatUiMessage = { id: createMessageId(), from: "user", text: trimmed };
      const aiMsgId = createMessageId();

      const history: AiChatMessage[] = messagesRef.current
        .filter((message) => !message.streaming && message.text)
        .map((message) => ({
          role: message.from === "user" ? "user" : "assistant",
          content: message.text,
        }));
      history.push({ role: "user", content: trimmed });

      setMessages((prev) => [
        ...prev,
        userMsg,
        { id: aiMsgId, from: "ai", text: "", streaming: true },
      ]);
      setIsStreaming(true);

      const controller = new AbortController();
      abortRef.current = controller;

      const finishAiMessage = (updater: (current: ChatUiMessage) => ChatUiMessage) => {
        setMessages((prev) => prev.map((message) => (message.id === aiMsgId ? updater(message) : message)));
      };

      try {
        const stream = apiUrl
          ? streamAiChatRequest({
              url: apiUrl,
              messages: history,
              signal: controller.signal,
              headers: getAuthHeaders?.(),
            })
          : mockAiChatStream(mockReply(trimmed));

        for await (const event of stream) {
          if (event.type === "delta") {
            finishAiMessage((message) => ({
              ...message,
              text: message.text + event.content,
            }));
            continue;
          }

          if (event.type === "error") {
            finishAiMessage((message) => ({
              ...message,
              text: message.text || event.message,
              streaming: false,
            }));
            break;
          }

          if (event.type === "done") {
            finishAiMessage((message) => ({ ...message, streaming: false }));
            break;
          }
        }
      } catch (error) {
        if ((error as Error).name === "AbortError") return;

        finishAiMessage((message) => ({
          ...message,
          text: message.text || streamErrorText,
          streaming: false,
        }));
      } finally {
        setIsStreaming(false);
        abortRef.current = null;
        finishAiMessage((message) => ({ ...message, streaming: false }));
      }
    },
    [apiUrl, getAuthHeaders, isStreaming, mockReply, streamErrorText],
  );

  return { messages, isStreaming, send, abort, setWelcome };
}
