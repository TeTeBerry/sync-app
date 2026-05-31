import { useCallback, useEffect, useRef, useState } from "react";
import { useDidShow } from "@tarojs/taro";
import { fetchChatSession, clearChatSession } from "../../api/syncApi";
import { useAiChatStore } from "../../stores/aiChatStore";
import { mapHistoryToUiMessages } from "../../utils/aiChatHistory";
import { isApiEnabled } from "../../constants/api";
import {
  createFreshActivitySessionId,
  createFreshSessionId,
  getOrCreateActivitySessionId,
  getOrCreateSessionId,
  persistSessionId,
} from "../../utils/session";
import type { ChatUiMessage } from "../../types/aiChat";
import { closeAiChatWsConnection } from "../../utils/aiChatWs";
import { createMessageId } from "./createMessageId";

export interface UseChatSessionOptions {
  welcomeText: string;
  sessionId?: string;
  activityLegacyId?: number;
  userId?: string;
  userName?: string;
  userPhone?: string;
}

function resolveSessionId(
  sessionIdOption: string | undefined,
  activityLegacyId: number | undefined,
): string {
  if (sessionIdOption?.trim()) return sessionIdOption.trim();
  if (activityLegacyId != null && !Number.isNaN(activityLegacyId)) {
    return getOrCreateActivitySessionId(activityLegacyId);
  }
  return getOrCreateSessionId();
}

function createFreshSessionIdForScope(
  activityLegacyId: number | undefined,
): string {
  if (activityLegacyId != null && !Number.isNaN(activityLegacyId)) {
    return createFreshActivitySessionId(activityLegacyId);
  }
  return createFreshSessionId();
}

export function useChatSession(options: UseChatSessionOptions) {
  const { welcomeText, activityLegacyId } = options;
  const activityLegacyIdRef = useRef(activityLegacyId);

  const sessionIdRef = useRef(
    resolveSessionId(options.sessionId, activityLegacyId),
  );
  const userIdRef = useRef(options.userId);
  const userNameRef = useRef(options.userName);
  const userPhoneRef = useRef(options.userPhone);
  const historyLoadSeqRef = useRef(0);
  const hasLoadedHistoryRef = useRef(false);

  const [messages, setMessages] = useState<ChatUiMessage[]>(() => [
    { id: createMessageId(), from: "ai", text: welcomeText },
  ]);
  const [isLoadingHistory, setIsLoadingHistory] = useState(false);
  const messagesRef = useRef<ChatUiMessage[]>(messages);
  const isStreamingRef = useRef(false);

  useEffect(() => {
    messagesRef.current = messages;
  }, [messages]);

  useEffect(() => {
    activityLegacyIdRef.current = activityLegacyId;
  }, [activityLegacyId]);

  const setIsStreamingRef = useCallback((value: boolean) => {
    isStreamingRef.current = value;
  }, []);

  const cancelHistoryLoad = useCallback(() => {
    historyLoadSeqRef.current += 1;
    setIsLoadingHistory(false);
  }, []);

  const showWelcome = useCallback(() => {
    setMessages([{ id: createMessageId(), from: "ai", text: welcomeText }]);
  }, [welcomeText]);

  const loadSessionHistory = useCallback(async () => {
    if (isStreamingRef.current) {
      setIsLoadingHistory(false);
      return;
    }
    if (hasLoadedHistoryRef.current) return;

    if (!isApiEnabled()) {
      showWelcome();
      hasLoadedHistoryRef.current = true;
      return;
    }

    const requestSessionId = sessionIdRef.current;
    const loadSeq = ++historyLoadSeqRef.current;

    setIsLoadingHistory(true);
    try {
      const session = await fetchChatSession(requestSessionId);
      if (
        loadSeq !== historyLoadSeqRef.current ||
        requestSessionId !== sessionIdRef.current ||
        isStreamingRef.current
      ) {
        return;
      }

      const uiMessages = session.history?.length
        ? mapHistoryToUiMessages(session.history, requestSessionId)
        : [];
      if (session.conversationState) {
        useAiChatStore.getState().applyConversationPatch(session.conversationState);
      }

      if (uiMessages.length > 0) {
        setMessages(uiMessages);
      } else {
        showWelcome();
      }
      hasLoadedHistoryRef.current = true;
    } catch {
      if (
        loadSeq === historyLoadSeqRef.current &&
        requestSessionId === sessionIdRef.current &&
        !isStreamingRef.current
      ) {
        showWelcome();
      }
      hasLoadedHistoryRef.current = true;
    } finally {
      if (loadSeq === historyLoadSeqRef.current) {
        setIsLoadingHistory(false);
      }
    }
  }, [showWelcome]);

  useEffect(() => {
    const nextSessionId = resolveSessionId(
      options.sessionId,
      activityLegacyId,
    );
    if (sessionIdRef.current === nextSessionId) return;

    historyLoadSeqRef.current += 1;
    setIsLoadingHistory(false);
    hasLoadedHistoryRef.current = false;
    sessionIdRef.current = nextSessionId;
    const hasUserMessages = messagesRef.current.some((m) => m.from === "user");
    if (!hasUserMessages && !isStreamingRef.current) {
      showWelcome();
    }
    void loadSessionHistory();
  }, [activityLegacyId, loadSessionHistory, options.sessionId, showWelcome]);

  useEffect(() => {
    void loadSessionHistory();
  }, [loadSessionHistory]);

  useDidShow(() => {
    void loadSessionHistory();
  });

  const resetSession = useCallback(async () => {
    historyLoadSeqRef.current += 1;
    hasLoadedHistoryRef.current = false;
    closeAiChatWsConnection("clear chat");

    const previousSessionId = sessionIdRef.current;
    try {
      await clearChatSession(previousSessionId);
    } catch {
      // ignore network errors; still reset local state
    }

    const nextSessionId = createFreshSessionIdForScope(
      activityLegacyIdRef.current,
    );
    sessionIdRef.current = nextSessionId;
    persistSessionId(nextSessionId, activityLegacyIdRef.current);
    messagesRef.current = [];
    setMessages([]);
    showWelcome();
    return nextSessionId;
  }, [showWelcome]);

  const persistSessionFromStream = useCallback((sessionId: string) => {
    sessionIdRef.current = sessionId;
    persistSessionId(sessionId, activityLegacyIdRef.current);
  }, []);

  return {
    messages,
    setMessages,
    messagesRef,
    isLoadingHistory,
    loadSessionHistory,
    showWelcome,
    resetSession,
    persistSessionFromStream,
    sessionIdRef,
    userIdRef,
    userNameRef,
    userPhoneRef,
    setIsStreamingRef,
    isStreamingRef,
    cancelHistoryLoad,
  };
}
