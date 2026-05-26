import { useCallback, useEffect, useRef, useState } from "react";
import { useDidShow } from "@tarojs/taro";
import { fetchChatSession } from "../api/syncApi";
import { AI_CHAT_STREAM_URL } from "../constants/api";
import type { AiChatStreamEvent, ChatUiMessage, SendChatOptions } from "../types/aiChat";
import {
  buildApiChatHistory,
  mapHistoryToUiMessages,
} from "../utils/aiChatHistory";
import { mockAiChatStream, streamAiChatRequest } from "../utils/aiChatStream";
import { createTypewriterReveal } from "../utils/typewriterReveal";
import {
  getClientUserId,
  getClientUserName,
  getClientUserPhone,
  getOrCreateSessionId,
  persistSessionId,
} from "../utils/session";

function createMessageId() {
  return `${Date.now()}-${Math.random().toString(36).slice(2, 9)}`;
}

export interface UseAiChatStreamOptions {
  welcomeText: string;
  /** 打字机每字间隔（毫秒） */
  typewriterCharDelayMs?: number;
  /** Used when `TARO_APP_AI_CHAT_URL` is unset */
  mockReply: (query: string) => string;
  streamErrorText: string;
  apiUrl?: string;
  sessionId?: string;
  userId?: string;
  userName?: string;
  userPhone?: string;
  activityLegacyId?: number;
  getAuthHeaders?: () => Record<string, string>;
  onPostCreated?: (
    event: Extract<AiChatStreamEvent, { type: "post_created" }>,
  ) => void;
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
    userPhone: userPhoneOption,
    activityLegacyId,
    getAuthHeaders,
    onPostCreated,
    typewriterCharDelayMs = 22,
  } = options;

  const activityLegacyIdRef = useRef(activityLegacyId);

  const sessionIdRef = useRef(sessionIdOption ?? getOrCreateSessionId());
  const userIdRef = useRef(userIdOption ?? getClientUserId());
  const userNameRef = useRef(userNameOption ?? getClientUserName());
  const userPhoneRef = useRef(userPhoneOption ?? getClientUserPhone());

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
    activityLegacyIdRef.current = activityLegacyId;
  }, [activityLegacyId]);

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
      if (isStreamingRef.current) return;

      if (session.history?.length) {
        setMessages(
          mapHistoryToUiMessages(session.history, sessionIdRef.current),
        );
      } else {
        showWelcome();
      }
    } catch {
      if (!isStreamingRef.current) {
        showWelcome();
      }
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
    async (payload: string | SendChatOptions) => {
      const options = typeof payload === "string" ? { text: payload } : payload;
      const { text, image } = options;
      const trimmed = text.trim();
      if ((!trimmed && !image) || isStreaming) return;

      const userMsg: ChatUiMessage = {
        id: createMessageId(),
        from: "user",
        text: trimmed,
        imagePreview: image,
        ocrText: image ? trimmed : undefined,
      };
      const aiMsgId = createMessageId();
      const baseMessages = messagesRef.current;
      const history = buildApiChatHistory(
        baseMessages,
        welcomeText,
        trimmed,
        image,
      );

      const nextMessages: ChatUiMessage[] = [
        ...baseMessages,
        userMsg,
        { id: aiMsgId, from: "ai", text: "", streaming: true },
      ];
      messagesRef.current = nextMessages;
      setMessages(nextMessages);
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

      const typewriter = createTypewriterReveal({
        charDelayMs: typewriterCharDelayMs,
        onUpdate: (visible) => {
          finishAiMessage((message) => ({ ...message, text: visible }));
        },
      });

      try {
        const activityId = activityLegacyIdRef.current;
        const activityHeaders =
          activityId != null
            ? { "X-Activity-Id": String(activityId) }
            : undefined;

        const stream = apiUrl
          ? streamAiChatRequest({
              url: apiUrl,
              messages: history,
              sessionId: sessionIdRef.current,
              userId: userIdRef.current,
              userName: userNameRef.current,
              userPhone: userPhoneRef.current,
              activityLegacyId: activityId,
              image,
              signal: controller.signal,
              headers: {
                ...activityHeaders,
                ...getAuthHeaders?.(),
              },
            })
          : mockAiChatStream(mockReply(trimmed));

        for await (const event of stream) {
          if (event.type === "delta") {
            typewriter.append(event.content);
            continue;
          }

          if (event.type === "post_created") {
            onPostCreated?.(event);
            continue;
          }

          if (event.type === "error") {
            typewriter.flush();
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
            }));
            await typewriter.waitUntilComplete();
            finishAiMessage((message) => ({
              ...message,
              text: typewriter.getTarget() || message.text,
              streaming: false,
            }));
            if (event.sessionId) {
              sessionIdRef.current = event.sessionId;
              persistSessionId(event.sessionId);
            }
            break;
          }
        }
      } catch (error) {
        if ((error as Error).name === "AbortError") {
          typewriter.stop();
          return;
        }

        typewriter.flush();
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
      onPostCreated,
      streamErrorText,
      typewriterCharDelayMs,
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
