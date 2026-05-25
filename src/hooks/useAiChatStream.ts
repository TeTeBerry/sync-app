import { useCallback, useEffect, useRef, useState } from "react";
import { useDidShow } from "@tarojs/taro";
import { useQueryClient } from "@tanstack/react-query";
import { fetchChatSession } from "../api/syncApi";
import { AI_CHAT_STREAM_URL } from "../constants/api";
import type { ChatUiMessage } from "../types/aiChat";
import { invalidateTicketQueries } from "./useSyncApi";
import { buildApiChatHistory, mapHistoryToUiMessages } from "../utils/aiChatHistory";
import { mockAiChatStream, streamAiChatRequest } from "../utils/aiChatStream";
import { getClientUserId, getClientUserName, getOrCreateSessionId, persistSessionId } from "../utils/session";

function createMessageId() {
  return `${Date.now()}-${Math.random().toString(36).slice(2, 9)}`;
}

export interface UseAiChatStreamOptions {
  welcomeText: string;
  /** Used when `TARO_APP_AI_CHAT_URL` is unset */
  mockReply: (query: string) => string;
  streamErrorText: string;
  apiUrl?: string;
  sessionId?: string;
  userId?: string;
  userName?: string;
  getAuthHeaders?: () => Record<string, string>;
  /** Called when backend confirms a ticket listing was created */
  onTicketCreated?: (ticketId: string) => void;
}

export function useAiChatStream(options: UseAiChatStreamOptions) {
  const {
    welcomeText,
    mockReply,
    streamErrorText,
    apiUrl = AI_CHAT_STREAM_URL,
    sessionId: sessionIdOption,
    userId: userIdOption,
    userName: userNameOption,
    getAuthHeaders,
    onTicketCreated,
  } = options;

  const queryClient = useQueryClient();
  const sessionIdRef = useRef(sessionIdOption ?? getOrCreateSessionId());
  const userIdRef = useRef(userIdOption ?? getClientUserId());
  const userNameRef = useRef(userNameOption ?? getClientUserName());

  const [messages, setMessages] = useState<ChatUiMessage[]>([]);
  const [isStreaming, setIsStreaming] = useState(false);
  const [isLoadingHistory, setIsLoadingHistory] = useState(false);
  const abortRef = useRef<AbortController | null>(null);
  const messagesRef = useRef<ChatUiMessage[]>(messages);
  const isStreamingRef = useRef(isStreaming);

  useEffect(() => {
    messagesRef.current = messages;
  }, [messages]);

  useEffect(() => {
    isStreamingRef.current = isStreaming;
  }, [isStreaming]);

  useEffect(() => {
    return () => abortRef.current?.abort();
  }, []);

  const showWelcome = useCallback(() => {
    setMessages([{ id: createMessageId(), from: "ai", text: welcomeText }]);
  }, [welcomeText]);

  const loadSessionHistory = useCallback(async () => {
    if (isStreamingRef.current) return;

    if (!apiUrl) {
      showWelcome();
      return;
    }

    setIsLoadingHistory(true);
    try {
      const session = await fetchChatSession(sessionIdRef.current);
      if (session.history?.length) {
        setMessages(mapHistoryToUiMessages(session.history, sessionIdRef.current));
      } else {
        showWelcome();
      }
    } catch {
      showWelcome();
    } finally {
      setIsLoadingHistory(false);
    }
  }, [apiUrl, showWelcome]);

  useDidShow(() => {
    void loadSessionHistory();
  });

  const abort = useCallback(() => {
    abortRef.current?.abort();
  }, []);

  const send = useCallback(
    async (text: string) => {
      const trimmed = text.trim();
      if (!trimmed || isStreaming) return;

      const userMsg: ChatUiMessage = {
        id: createMessageId(),
        from: "user",
        text: trimmed,
      };
      const aiMsgId = createMessageId();
      const history = buildApiChatHistory(messagesRef.current, welcomeText, trimmed);

      setMessages((prev) => [
        ...prev,
        userMsg,
        { id: aiMsgId, from: "ai", text: "", streaming: true },
      ]);
      setIsStreaming(true);

      const controller = new AbortController();
      abortRef.current = controller;

      const finishAiMessage = (
        updater: (current: ChatUiMessage) => ChatUiMessage,
      ) => {
        setMessages((prev) =>
          prev.map((message) =>
            message.id === aiMsgId ? updater(message) : message,
          ),
        );
      };

      try {
        const stream = apiUrl
          ? streamAiChatRequest({
              url: apiUrl,
              messages: history,
              sessionId: sessionIdRef.current,
              userId: userIdRef.current,
              userName: userNameRef.current,
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
            finishAiMessage((message) => ({
              ...message,
              streaming: false,
              ticketCard: event.ticketCard ?? message.ticketCard,
            }));
            if (event.sessionId) {
              sessionIdRef.current = event.sessionId;
              persistSessionId(event.sessionId);
            }
            if (event.ticketId) {
              onTicketCreated?.(event.ticketId);
              void invalidateTicketQueries(queryClient);
            }
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
    [
      apiUrl,
      getAuthHeaders,
      isStreaming,
      mockReply,
      onTicketCreated,
      queryClient,
      streamErrorText,
      welcomeText,
    ],
  );

  return {
    messages,
    isStreaming,
    isLoadingHistory,
    send,
    abort,
    reloadHistory: loadSessionHistory,
  };
}
