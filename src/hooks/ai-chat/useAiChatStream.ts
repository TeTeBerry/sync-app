import { useCallback, useEffect, useRef, useState } from 'react';
import Taro from '@tarojs/taro';
import { AI_CHAT_WS_URL } from '../../constants/api';
import { useAiChatStore } from '../../stores/aiChatStore';
import type {
  AiChatStreamEvent,
  ChatUiMessage,
  SendChatOptions,
} from '../../types/aiChat';
import { getClientSessionIdentity } from '../../api/requestActor';
import {
  startAiChatStagedProgress,
  withAiChatProgress,
} from '../../utils/aiChatStagedProgress';
import { resolveAiChatProgressKind } from '../../utils/resolveAiChatProgressKind';
import { createMessageId } from './createMessageId';
import { useChatSession } from './useChatSession';
import { useWsChatStream } from './useWsChatStream';
import { useTypewriterReply } from './useTypewriterReply';

export interface UseAiChatStreamOptions {
  activityTitle?: string;
  /** 打字机每字间隔（毫秒） */
  typewriterCharDelayMs?: number;
  streamErrorText: string;
  wsUrl?: string;
  sessionId?: string;
  userId?: string;
  userName?: string;
  userPhone?: string;
  activityLegacyId?: number;
  getAuthHeaders?: () => Record<string, string>;
  onPostCreated?: (event: Extract<AiChatStreamEvent, { type: 'post_created' }>) => void;
  onExistingPost?: (
    event: Extract<AiChatStreamEvent, { type: 'existing_post' }>,
  ) => void;
  onTravelGuideReady?: (
    event: Extract<AiChatStreamEvent, { type: 'travel_guide_ready' }>,
  ) => void;
  onItineraryReady?: (
    event: Extract<AiChatStreamEvent, { type: 'itinerary_ready' }>,
  ) => void;
}

export function useAiChatStream(options: UseAiChatStreamOptions) {
  const {
    activityTitle,
    streamErrorText,
    wsUrl: wsUrlOption,
    sessionId: sessionIdOption,
    userId: userIdOption,
    userName: userNameOption,
    userPhone: userPhoneOption,
    activityLegacyId,
    getAuthHeaders,
    onPostCreated,
    onExistingPost,
    onTravelGuideReady,
    onItineraryReady,
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
    hasMoreHistory,
    loadOlderMessages,
    resetSession,
    persistSessionFromStream,
    sessionIdRef,
    setIsStreamingRef,
    isStreamingRef,
    cancelHistoryLoad,
    showWelcome,
    applyActivityBinding,
  } = useChatSession({
    activityTitle,
    sessionId: sessionIdOption,
    activityLegacyId,
    userId: userIdOption ?? getClientSessionIdentity().userId,
    userName: userNameOption ?? getClientSessionIdentity().displayName,
    userPhone: userPhoneOption ?? getClientSessionIdentity().userPhone,
  });

  const wsUrl = wsUrlOption ?? AI_CHAT_WS_URL;

  const { createTypewriter } = useTypewriterReply();
  const { runStream } = useWsChatStream({
    streamErrorText,
    wsUrl,
    activityLegacyIdRef,
    sessionIdRef,
    messagesRef,
    setMessages,
    getAuthHeaders,
    onPostCreated,
    onExistingPost,
    onTravelGuideReady,
    onItineraryReady,
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
      const { text } = sendOptions;
      const trimmed = text.trim();
      if (!trimmed) return;

      cancelHistoryLoad();
      abortRef.current?.abort();

      const userMsg: ChatUiMessage = {
        id: createMessageId(),
        from: 'user',
        text: trimmed,
      };
      const aiMsgId = createMessageId();
      const progressKind = resolveAiChatProgressKind({ text: trimmed });
      const baseMessages = messagesRef.current;
      const nextMessages: ChatUiMessage[] = [
        ...baseMessages,
        userMsg,
        withAiChatProgress({ id: aiMsgId, from: 'ai', text: '' }, progressKind),
      ];
      messagesRef.current = nextMessages;
      setMessages(nextMessages);
      setIsStreaming(true);
      setIsStreamingRef(true);

      const stopStagedProgress = startAiChatStagedProgress({
        aiMsgId,
        kind: progressKind,
        messagesRef,
        setMessages,
      });

      const controller = new AbortController();
      abortRef.current = controller;

      try {
        await runStream(sendOptions, aiMsgId, controller.signal, stopStagedProgress);
      } catch (error) {
        if ((error as Error).name === 'AbortError') {
          return;
        }
        // Transport layer (`useWsChatStream`) already surfaces user-facing toasts.
      } finally {
        stopStagedProgress();
        setIsStreaming(false);
        setIsStreamingRef(false);
        abortRef.current = null;
      }
    },
    [cancelHistoryLoad, messagesRef, runStream, setIsStreamingRef, setMessages],
  );

  const send = useCallback(
    async (payload: string | SendChatOptions) => {
      const sendOptions = typeof payload === 'string' ? { text: payload } : payload;
      const trimmed = sendOptions.text.trim();
      if (!trimmed) return;

      if (isStreamingRef.current) {
        void Taro.showToast({ title: '请等待上一条回复', icon: 'none' });
        return;
      }

      // Cancel in-flight session hydrate so chip/send is never stuck behind
      // isLoadingHistoryRef vs isLoadingHistory state desync.
      cancelHistoryLoad();
      await executeSend(sendOptions);
    },
    [cancelHistoryLoad, executeSend, isStreamingRef],
  );

  const loadOlderMessagesWithCount = useCallback(async () => {
    const beforeCount = messagesRef.current.length;
    const loaded = await loadOlderMessages();
    if (!loaded) return 0;
    return messagesRef.current.length - beforeCount;
  }, [loadOlderMessages, messagesRef]);

  const clearChat = useCallback(async () => {
    abortRef.current?.abort();
    const scopeKey = useAiChatStore.getState().activeScopeKey;
    if (scopeKey) {
      useAiChatStore.getState().resetScope(scopeKey);
    }
    await resetSession();
    setIsStreaming(false);
  }, [resetSession]);

  return {
    messages,
    setMessages,
    messagesRef,
    isStreaming,
    isStreamingRef,
    isLoadingHistory,
    hasMoreHistory,
    loadOlderMessages: loadOlderMessagesWithCount,
    send,
    abort,
    clearChat,
    showWelcome,
    applyActivityBinding,
    sessionIdRef,
    sessionId: sessionIdRef.current,
  };
}
