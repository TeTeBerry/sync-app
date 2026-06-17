import { useCallback, useEffect, useRef, useState } from 'react';
import type { Dispatch, SetStateAction } from 'react';
import { clearChatSession } from '../../api/syncApi';
import { useAiChatStore } from '../../stores/aiChatStore';
import { isLiveApi } from '../../constants/api';
import {
  createFreshActivitySessionId,
  createFreshSessionId,
  getOrCreateActivitySessionId,
  getOrCreateSessionId,
  persistSessionId,
} from '../../utils/session';
import { buildAiChatScopeKey } from '../../utils/aiChatScope';
import { createWelcomeChatMessage } from '../../utils/aiAssistantCapabilityDiscovery';
import type { ChatUiMessage } from '../../types/aiChat';
import { closeAiChatWsConnection } from '../../utils/aiChatWs';

export interface UseChatSessionOptions {
  activityTitle?: string;
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

function createWelcomeMessage(
  activityTitle?: string,
  activityLegacyId?: number,
): ChatUiMessage {
  return createWelcomeChatMessage(activityTitle, activityLegacyId);
}

export function useChatSession(options: UseChatSessionOptions) {
  const { activityTitle, activityLegacyId } = options;
  const activityLegacyIdRef = useRef(activityLegacyId);
  const scopeKey = buildAiChatScopeKey(activityLegacyId);

  const sessionIdRef = useRef(resolveSessionId(options.sessionId, activityLegacyId));
  const userIdRef = useRef(options.userId);
  const userNameRef = useRef(options.userName);
  const userPhoneRef = useRef(options.userPhone);

  const [messages, setMessagesState] = useState<ChatUiMessage[]>(() => {
    const stored = useAiChatStore.getState().getScopeMessages(scopeKey);
    if (stored.length > 0) return stored;
    return [createWelcomeMessage(activityTitle, activityLegacyId)];
  });
  const messagesRef = useRef<ChatUiMessage[]>(messages);
  const isStreamingRef = useRef(false);

  const setMessages = useCallback<Dispatch<SetStateAction<ChatUiMessage[]>>>(
    (action) => {
      setMessagesState((prev) => {
        const next = typeof action === 'function' ? action(prev) : action;
        messagesRef.current = next;
        useAiChatStore.getState().setScopeMessages(scopeKey, next);
        return next;
      });
    },
    [scopeKey],
  );

  useEffect(() => {
    messagesRef.current = messages;
  }, [messages]);

  useEffect(() => {
    activityLegacyIdRef.current = activityLegacyId;
  }, [activityLegacyId]);

  useEffect(() => {
    useAiChatStore.getState().setActiveScope(scopeKey);
  }, [scopeKey]);

  const setIsStreamingRef = useCallback((value: boolean) => {
    isStreamingRef.current = value;
  }, []);

  const showWelcome = useCallback(() => {
    const welcome = [createWelcomeMessage(activityTitle, activityLegacyIdRef.current)];
    messagesRef.current = welcome;
    setMessages(welcome);
  }, [activityTitle, setMessages]);

  const applyActivityBinding = useCallback(
    (activity: { legacyId: number; name?: string }) => {
      const legacyId = activity.legacyId;
      if (!Number.isFinite(legacyId) || legacyId <= 0) {
        return;
      }

      const nextScopeKey = buildAiChatScopeKey(legacyId);
      const welcome = [createWelcomeChatMessage(activity.name, legacyId)];
      const nextSessionId = getOrCreateActivitySessionId(legacyId);

      sessionIdRef.current = nextSessionId;
      activityLegacyIdRef.current = legacyId;
      useAiChatStore.getState().setActiveScope(nextScopeKey);
      useAiChatStore.getState().setScopeMessages(nextScopeKey, welcome);
      messagesRef.current = welcome;
      setMessagesState(welcome);
    },
    [],
  );

  const hydrateScopeMessages = useCallback(() => {
    const stored = useAiChatStore.getState().getScopeMessages(scopeKey);
    if (stored.length > 0) {
      messagesRef.current = stored;
      setMessages(stored);
      return;
    }
    showWelcome();
  }, [scopeKey, setMessages, showWelcome]);

  const hasInFlightChatTurn = useCallback(
    () =>
      isStreamingRef.current ||
      messagesRef.current.some((message) => message.streaming),
    [],
  );

  useEffect(() => {
    const nextSessionId = resolveSessionId(options.sessionId, activityLegacyId);
    const sessionChanged = sessionIdRef.current !== nextSessionId;
    sessionIdRef.current = nextSessionId;

    useAiChatStore.getState().setActiveScope(scopeKey);

    if (!sessionChanged || hasInFlightChatTurn()) return;
    hydrateScopeMessages();
  }, [
    activityLegacyId,
    hasInFlightChatTurn,
    hydrateScopeMessages,
    options.sessionId,
    scopeKey,
  ]);

  const resetSession = useCallback(async () => {
    closeAiChatWsConnection('clear chat');

    const previousSessionId = sessionIdRef.current;
    if (isLiveApi()) {
      try {
        await clearChatSession(previousSessionId);
      } catch {
        // ignore network errors; still reset local state
      }
    }

    const nextSessionId = createFreshSessionIdForScope(activityLegacyIdRef.current);
    sessionIdRef.current = nextSessionId;
    persistSessionId(nextSessionId, activityLegacyIdRef.current);
    useAiChatStore.getState().resetScope(scopeKey);
    messagesRef.current = [];
    showWelcome();
    return nextSessionId;
  }, [scopeKey, showWelcome]);

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
    applyActivityBinding,
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
