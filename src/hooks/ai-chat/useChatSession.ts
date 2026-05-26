import { useCallback, useEffect, useRef, useState } from "react";
import { useDidShow } from "@tarojs/taro";
import { fetchChatSession, clearChatSession } from "../../api/syncApi";
import { mapHistoryToUiMessages } from "../../utils/aiChatHistory";
import {
  createFreshSessionId,
  getOrCreateSessionId,
  persistSessionId,
} from "../../utils/session";
import type { ChatUiMessage } from "../../types/aiChat";
import { createMessageId } from "./createMessageId";

export interface UseChatSessionOptions {
  welcomeText: string;
  apiUrl?: string;
  sessionId?: string;
  userId?: string;
  userName?: string;
  userPhone?: string;
}

export function useChatSession(options: UseChatSessionOptions) {
  const { welcomeText, apiUrl } = options;

  const sessionIdRef = useRef(options.sessionId ?? getOrCreateSessionId());
  const userIdRef = useRef(options.userId);
  const userNameRef = useRef(options.userName);
  const userPhoneRef = useRef(options.userPhone);

  const [messages, setMessages] = useState<ChatUiMessage[]>([]);
  const [isLoadingHistory, setIsLoadingHistory] = useState(false);
  const messagesRef = useRef<ChatUiMessage[]>(messages);
  const isStreamingRef = useRef(false);

  useEffect(() => {
    messagesRef.current = messages;
  }, [messages]);

  const setIsStreamingRef = useCallback((value: boolean) => {
    isStreamingRef.current = value;
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

  const resetSession = useCallback(async () => {
    const previousSessionId = sessionIdRef.current;
    try {
      await clearChatSession(previousSessionId);
    } catch {
      // ignore network errors; still reset local state
    }

    const nextSessionId = createFreshSessionId();
    sessionIdRef.current = nextSessionId;
    persistSessionId(nextSessionId);
    messagesRef.current = [];
    setMessages([]);
    showWelcome();
    return nextSessionId;
  }, [showWelcome]);

  const persistSessionFromStream = useCallback((sessionId: string) => {
    sessionIdRef.current = sessionId;
    persistSessionId(sessionId);
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
  };
}
