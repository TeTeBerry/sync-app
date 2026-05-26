import { useCallback, useEffect, useRef, useState } from "react";
import { AI_CHAT_STREAM_URL } from "../../constants/api";
import { useAiChatStore } from "../../stores/aiChatStore";
import type { AiChatStreamEvent, ChatUiMessage, SendChatOptions } from "../../types/aiChat";
import {
  getClientUserId,
  getClientUserName,
  getClientUserPhone,
} from "../../utils/session";
import { createMessageId } from "./createMessageId";
import { useChatSession } from "./useChatSession";
import { useSseChatStream } from "./useSseChatStream";
import { useTypewriterReply } from "./useTypewriterReply";

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
  onExistingPost?: (
    event: Extract<AiChatStreamEvent, { type: "existing_post" }>,
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
    onExistingPost,
    typewriterCharDelayMs = 22,
  } = options;

  const activityLegacyIdRef = useRef(activityLegacyId);
  const [isStreaming, setIsStreaming] = useState(false);
  const abortRef = useRef<AbortController | null>(null);

  const {
    messages,
    setMessages,
    messagesRef,
    isLoadingHistory,
    loadSessionHistory,
    resetSession,
    persistSessionFromStream,
    sessionIdRef,
    userIdRef,
    userNameRef,
    userPhoneRef,
    setIsStreamingRef,
  } = useChatSession({
    welcomeText,
    apiUrl,
    sessionId: sessionIdOption,
    userId: userIdOption ?? getClientUserId(),
    userName: userNameOption ?? getClientUserName(),
    userPhone: userPhoneOption ?? getClientUserPhone(),
  });

  const { createTypewriter } = useTypewriterReply();
  const { runStream } = useSseChatStream({
    welcomeText,
    mockReply,
    streamErrorText,
    apiUrl,
    activityLegacyIdRef,
    sessionIdRef,
    userIdRef,
    userNameRef,
    userPhoneRef,
    messagesRef,
    setMessages,
    getAuthHeaders,
    onPostCreated,
    onExistingPost,
    persistSessionFromStream,
    createTypewriter,
    typewriterCharDelayMs,
  });

  useEffect(() => {
    activityLegacyIdRef.current = activityLegacyId;
  }, [activityLegacyId]);

  useEffect(() => {
    setIsStreamingRef(isStreaming);
  }, [isStreaming, setIsStreamingRef]);

  useEffect(() => {
    return () => abortRef.current?.abort();
  }, []);

  const abort = useCallback(() => {
    abortRef.current?.abort();
  }, []);

  const send = useCallback(
    async (payload: string | SendChatOptions) => {
      const sendOptions = typeof payload === "string" ? { text: payload } : payload;
      const { text, image } = sendOptions;
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

      try {
        await runStream(sendOptions, aiMsgId, controller.signal);
      } catch (error) {
        if ((error as Error).name === "AbortError") {
          return;
        }
      } finally {
        setIsStreaming(false);
        abortRef.current = null;
      }
    },
    [isStreaming, messagesRef, runStream, setMessages],
  );

  const clearChat = useCallback(async () => {
    abortRef.current?.abort();
    useAiChatStore.getState().resetOnClearSession();
    await resetSession();
    setIsStreaming(false);
  }, [resetSession]);

  return {
    messages,
    isStreaming,
    isLoadingHistory,
    send,
    abort,
    reloadHistory: loadSessionHistory,
    clearChat,
    sessionId: sessionIdRef.current,
  };
}
