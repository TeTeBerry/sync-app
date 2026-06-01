import { useCallback, useEffect, useRef, useState } from 'react';
import { useDidShow } from '@tarojs/taro';
import { fetchChatSession, clearChatSession } from '../../api/syncApi';
import { useAiChatStore } from '../../stores/aiChatStore';
import { mapHistoryToUiMessages } from '../../utils/aiChatHistory';
import {
  clearLocalChatHistory,
  readLocalChatHistory,
  writeLocalChatHistory,
} from '../../utils/aiChatLocalHistory';
import { isApiEnabled } from '../../constants/api';
import {
  createFreshActivitySessionId,
  createFreshSessionId,
  getOrCreateActivitySessionId,
  getOrCreateSessionId,
  persistSessionId,
} from '../../utils/session';
import type { ChatUiMessage } from '../../types/aiChat';
import { closeAiChatWsConnection } from '../../utils/aiChatWs';
import { createMessageId } from './createMessageId';

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

function createFreshSessionIdForScope(activityLegacyId: number | undefined): string {
  if (activityLegacyId != null && !Number.isNaN(activityLegacyId)) {
    return createFreshActivitySessionId(activityLegacyId);
  }
  return createFreshSessionId();
}

export function useChatSession(options: UseChatSessionOptions) {
  const { welcomeText, activityLegacyId } = options;
  const activityLegacyIdRef = useRef(activityLegacyId);

  const sessionIdRef = useRef(resolveSessionId(options.sessionId, activityLegacyId));
  const userIdRef = useRef(options.userId);
  const userNameRef = useRef(options.userName);
  const userPhoneRef = useRef(options.userPhone);
  const historyLoadSeqRef = useRef(0);
  const hasLoadedHistoryRef = useRef(false);
  const persistTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const [messages, setMessages] = useState<ChatUiMessage[]>(() => [
    { id: createMessageId(), from: 'ai', text: welcomeText },
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
    setMessages([{ id: createMessageId(), from: 'ai', text: welcomeText }]);
  }, [welcomeText]);

  const hasInFlightChatTurn = useCallback(
    () => isStreamingRef.current || messagesRef.current.some((message) => message.streaming),
    [],
  );

  const applyHydratedMessages = useCallback(
    (uiMessages: ChatUiMessage[], sessionId: string) => {
      if (uiMessages.length > 0) {
        setMessages(uiMessages);
        writeLocalChatHistory(sessionId, uiMessages);
        return;
      }
      const local = readLocalChatHistory(sessionId);
      if (local?.some((m) => m.from === 'user')) {
        setMessages(local);
        return;
      }
      showWelcome();
    },
    [showWelcome],
  );

  const loadSessionHistory = useCallback(
    async (options?: { force?: boolean }) => {
      if (hasInFlightChatTurn()) {
        setIsLoadingHistory(false);
        return;
      }
      if (!options?.force && hasLoadedHistoryRef.current) return;

      const requestSessionId = sessionIdRef.current;
      const loadSeq = ++historyLoadSeqRef.current;

      if (options?.force || !hasLoadedHistoryRef.current) {
        const cached = readLocalChatHistory(requestSessionId);
        if (cached?.some((m) => m.from === 'user')) {
          setMessages(cached);
        }
      }

      if (!isApiEnabled()) {
        applyHydratedMessages([], requestSessionId);
        hasLoadedHistoryRef.current = true;
        return;
      }

      setIsLoadingHistory(true);
      try {
        const session = await fetchChatSession(requestSessionId);
        if (
          loadSeq !== historyLoadSeqRef.current ||
          requestSessionId !== sessionIdRef.current ||
          hasInFlightChatTurn()
        ) {
          return;
        }

        const uiMessages = session.history?.length
          ? mapHistoryToUiMessages(session.history, requestSessionId)
          : [];
        if (session.conversationState) {
          useAiChatStore.getState().applyConversationPatch(session.conversationState);
        }

        applyHydratedMessages(uiMessages, requestSessionId);
        hasLoadedHistoryRef.current = true;
      } catch {
        if (
          loadSeq === historyLoadSeqRef.current &&
          requestSessionId === sessionIdRef.current &&
          !hasInFlightChatTurn()
        ) {
          applyHydratedMessages([], requestSessionId);
        }
        hasLoadedHistoryRef.current = true;
      } finally {
        if (loadSeq === historyLoadSeqRef.current) {
          setIsLoadingHistory(false);
        }
      }
    },
    [applyHydratedMessages, hasInFlightChatTurn, showWelcome],
  );

  useEffect(() => {
    const nextSessionId = resolveSessionId(options.sessionId, activityLegacyId);
    if (sessionIdRef.current === nextSessionId) return;

    historyLoadSeqRef.current += 1;
    setIsLoadingHistory(false);
    hasLoadedHistoryRef.current = false;
    sessionIdRef.current = nextSessionId;
    const hasUserMessages = messagesRef.current.some((m) => m.from === 'user');
    if (!hasUserMessages && !hasInFlightChatTurn()) {
      showWelcome();
    }
    void loadSessionHistory({ force: true });
  }, [activityLegacyId, hasInFlightChatTurn, loadSessionHistory, options.sessionId, showWelcome]);

  useDidShow(() => {
    void loadSessionHistory({ force: true });
  });

  useEffect(() => {
    return () => {
      historyLoadSeqRef.current += 1;
      hasLoadedHistoryRef.current = false;
      if (persistTimerRef.current != null) {
        clearTimeout(persistTimerRef.current);
      }
    };
  }, []);

  useEffect(() => {
    if (!hasLoadedHistoryRef.current) return;
    if (hasInFlightChatTurn()) return;
    if (!messages.some((m) => m.from === 'user' && !m.streaming)) return;

    if (persistTimerRef.current != null) {
      clearTimeout(persistTimerRef.current);
    }
    persistTimerRef.current = setTimeout(() => {
      writeLocalChatHistory(sessionIdRef.current, messagesRef.current);
    }, 400);

    return () => {
      if (persistTimerRef.current != null) {
        clearTimeout(persistTimerRef.current);
      }
    };
  }, [hasInFlightChatTurn, messages]);

  const resetSession = useCallback(async () => {
    historyLoadSeqRef.current += 1;
    hasLoadedHistoryRef.current = false;
    closeAiChatWsConnection('clear chat');

    const previousSessionId = sessionIdRef.current;
    try {
      await clearChatSession(previousSessionId);
    } catch {
      // ignore network errors; still reset local state
    }
    clearLocalChatHistory(previousSessionId);

    const nextSessionId = createFreshSessionIdForScope(activityLegacyIdRef.current);
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
