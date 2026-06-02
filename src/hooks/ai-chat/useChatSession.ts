import { useCallback, useEffect, useRef, useState } from 'react';
import { clearChatSession } from '../../api/syncApi';
import { useAiChatStore } from '../../stores/aiChatStore';
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

  const [messages, setMessages] = useState<ChatUiMessage[]>(() => [
    { id: createMessageId(), from: 'ai', text: welcomeText },
  ]);
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

  const showWelcome = useCallback(() => {
    setMessages([{ id: createMessageId(), from: 'ai', text: welcomeText }]);
  }, [welcomeText]);

  const hasInFlightChatTurn = useCallback(
    () =>
      isStreamingRef.current ||
      messagesRef.current.some((message) => message.streaming),
    [],
  );

  useEffect(() => {
    useAiChatStore.getState().resetOnClearSession();
  }, []);

  useEffect(() => {
    const nextSessionId = resolveSessionId(options.sessionId, activityLegacyId);
    if (sessionIdRef.current === nextSessionId) return;

    sessionIdRef.current = nextSessionId;
    useAiChatStore.getState().resetOnClearSession();
    if (!hasInFlightChatTurn()) {
      showWelcome();
    }
  }, [activityLegacyId, hasInFlightChatTurn, options.sessionId, showWelcome]);

  const resetSession = useCallback(async () => {
    closeAiChatWsConnection('clear chat');

    const previousSessionId = sessionIdRef.current;
    if (isApiEnabled()) {
      try {
        await clearChatSession(previousSessionId);
      } catch {
        // ignore network errors; still reset local state
      }
    }

    const nextSessionId = createFreshSessionIdForScope(activityLegacyIdRef.current);
    sessionIdRef.current = nextSessionId;
    persistSessionId(nextSessionId, activityLegacyIdRef.current);
    useAiChatStore.getState().resetOnClearSession();
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
    isLoadingHistory: false,
    showWelcome,
    resetSession,
    persistSessionFromStream,
    sessionIdRef,
    userIdRef,
    userNameRef,
    userPhoneRef,
    setIsStreamingRef,
    isStreamingRef,
    cancelHistoryLoad: () => undefined,
  };
}
