import { useCallback, useEffect, useRef, useState } from "react";
import Taro from "@tarojs/taro";
import { AI_CHAT_WS_URL } from "../../constants/api";
import { useAiChatStore } from "../../stores/aiChatStore";
import type { AiChatStreamEvent, ChatUiMessage, SendChatOptions } from "../../types/aiChat";
import {
  getClientUserId,
  getClientUserName,
  getClientUserPhone,
} from "../../utils/session";
import { formatAiChatToastError } from "../../utils/aiChatErrors";
import { createMessageId } from "./createMessageId";
import { useChatSession } from "./useChatSession";
import { useWsChatStream } from "./useWsChatStream";
import { useTypewriterReply } from "./useTypewriterReply";

export interface UseAiChatStreamOptions {
  welcomeText: string;
  /** 打字机每字间隔（毫秒） */
  typewriterCharDelayMs?: number;
  /** Used when WebSocket URL is unset */
  mockReply: (query: string) => string;
  streamErrorText: string;
  wsUrl?: string;
  /** @deprecated Use `wsUrl` */
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
    wsUrl: wsUrlOption,
    apiUrl: apiUrlDeprecated,
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
    isStreamingRef,
    cancelHistoryLoad,
  } = useChatSession({
    welcomeText,
    sessionId: sessionIdOption,
    activityLegacyId,
    userId: userIdOption ?? getClientUserId(),
    userName: userNameOption ?? getClientUserName(),
    userPhone: userPhoneOption ?? getClientUserPhone(),
  });

  const wsUrl = wsUrlOption ?? apiUrlDeprecated ?? AI_CHAT_WS_URL;

  const { createTypewriter } = useTypewriterReply();
  const { runStream } = useWsChatStream({
    welcomeText,
    mockReply,
    streamErrorText,
    wsUrl,
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

  const executeSend = useCallback(
    async (sendOptions: SendChatOptions) => {
      const { text, image, images } = sendOptions;
      const trimmed = text.trim();
      const hasImages = Boolean(image) || (images && images.length > 0);
      if (!trimmed && !hasImages) return;

      cancelHistoryLoad();

      const userMsg: ChatUiMessage = {
        id: createMessageId(),
        from: "user",
        text: trimmed,
        imagePreview: image ?? images?.[0],
        ocrText: hasImages ? trimmed : undefined,
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
        void Taro.showToast({
          title: formatAiChatToastError(error, streamErrorText),
          icon: "none",
        });
      } finally {
        setIsStreaming(false);
        abortRef.current = null;
      }
    },
    [cancelHistoryLoad, messagesRef, runStream, setMessages, streamErrorText],
  );

  const send = useCallback(
    async (payload: string | SendChatOptions) => {
      const sendOptions = typeof payload === "string" ? { text: payload } : payload;
      const { text, image, images } = sendOptions;
      const trimmed = text.trim();
      const hasImages = Boolean(image) || (images && images.length > 0);
      if (!trimmed && !hasImages) return;

      if (isStreamingRef.current) {
        void Taro.showToast({ title: "请等待上一条回复", icon: "none" });
        return;
      }

      // Cancel in-flight session hydrate so chip/send is never stuck behind
      // isLoadingHistoryRef vs isLoadingHistory state desync.
      cancelHistoryLoad();
      await executeSend(sendOptions);
    },
    [cancelHistoryLoad, executeSend, isStreamingRef],
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
