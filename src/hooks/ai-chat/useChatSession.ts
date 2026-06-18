import { useCallback, useEffect, useRef, useState } from 'react';
import type { Dispatch, SetStateAction } from 'react';
import { fetchChatSessionMessages, clearChatSession } from '../../api/sync/chat';
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
import type { BackendActivity } from '../../types/backend';
import { bindActivity } from '../../domains/activity-scope';
import { createWelcomeChatMessage } from '../../utils/aiAssistantCapabilityDiscovery';
import type { ChatUiMessage } from '../../types/aiChat';
import { closeAiChatWsConnection } from '../../utils/aiChatWs';
import {
  historyPageStartIndex,
  isWelcomeOnlyMessages,
  mapServerMessagesToUi,
} from '../../utils/mapChatHistory';

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
  const historyCursorRef = useRef<number | undefined>(undefined);
  const historyLoadAbortRef = useRef<AbortController | null>(null);
  const [isLoadingHistory, setIsLoadingHistory] = useState(false);
  const [hasMoreHistory, setHasMoreHistory] = useState(false);

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

  const cancelHistoryLoad = useCallback(() => {
    historyLoadAbortRef.current?.abort();
    historyLoadAbortRef.current = null;
    setIsLoadingHistory(false);
  }, []);

  const showWelcome = useCallback(() => {
    const welcome = [createWelcomeMessage(activityTitle, activityLegacyIdRef.current)];
    messagesRef.current = welcome;
    setMessages(welcome);
    historyCursorRef.current = undefined;
    setHasMoreHistory(false);
  }, [activityTitle, setMessages]);

  const hydrateRecentHistory = useCallback(async () => {
    if (!isLiveApi()) return;
    if (!isWelcomeOnlyMessages(messagesRef.current)) return;

    cancelHistoryLoad();
    const controller = new AbortController();
    historyLoadAbortRef.current = controller;
    setIsLoadingHistory(true);

    try {
      const page = await fetchChatSessionMessages(sessionIdRef.current, {
        limit: 30,
      });
      if (controller.signal.aborted) return;
      if (!page.items.length) return;

      const hydrated = mapServerMessagesToUi(page.items, {
        startIndex: historyPageStartIndex(page),
      });
      messagesRef.current = hydrated;
      setMessages(hydrated);
      historyCursorRef.current = page.nextBefore;
      setHasMoreHistory(page.hasMore);
      if (page.conversationState) {
        useAiChatStore.getState().applyConversationPatch(page.conversationState);
      }
    } catch {
      // keep welcome message on failure
    } finally {
      if (!controller.signal.aborted) {
        setIsLoadingHistory(false);
        historyLoadAbortRef.current = null;
      }
    }
  }, [cancelHistoryLoad, setMessages]);

  const loadOlderMessages = useCallback(async () => {
    if (!isLiveApi() || isLoadingHistory || !hasMoreHistory) return false;
    if (historyCursorRef.current == null) return false;

    cancelHistoryLoad();
    const controller = new AbortController();
    historyLoadAbortRef.current = controller;
    setIsLoadingHistory(true);

    try {
      const page = await fetchChatSessionMessages(sessionIdRef.current, {
        limit: 30,
        before: historyCursorRef.current,
      });
      if (controller.signal.aborted || !page.items.length) {
        return false;
      }

      const older = mapServerMessagesToUi(page.items, {
        startIndex: historyPageStartIndex(page),
      });
      setMessages((prev) => [...older, ...prev]);
      historyCursorRef.current = page.nextBefore;
      setHasMoreHistory(page.hasMore);
      return true;
    } catch {
      return false;
    } finally {
      if (!controller.signal.aborted) {
        setIsLoadingHistory(false);
        historyLoadAbortRef.current = null;
      }
    }
  }, [cancelHistoryLoad, hasMoreHistory, isLoadingHistory, setMessages]);

  const applyActivityBinding = useCallback(
    (activity: { legacyId: number; name?: string; activity?: BackendActivity }) => {
      const legacyId = activity.legacyId;
      if (
        !bindActivity(legacyId, {
          activity: activity.activity,
          activityName: activity.name,
          syncChatWelcome: true,
        })
      ) {
        return;
      }

      const nextScopeKey = buildAiChatScopeKey(legacyId);
      const welcome = useAiChatStore.getState().getScopeMessages(nextScopeKey);
      const nextSessionId = getOrCreateActivitySessionId(legacyId);

      sessionIdRef.current = nextSessionId;
      activityLegacyIdRef.current = legacyId;
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
      void hydrateRecentHistory();
      return;
    }
    showWelcome();
    void hydrateRecentHistory();
  }, [hydrateRecentHistory, scopeKey, setMessages, showWelcome]);

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
    cancelHistoryLoad();

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
  }, [cancelHistoryLoad, scopeKey, showWelcome]);

  const persistSessionFromStream = useCallback((sessionId: string) => {
    sessionIdRef.current = sessionId;
    persistSessionId(sessionId, activityLegacyIdRef.current);
  }, []);

  return {
    messages,
    setMessages,
    messagesRef,
    isLoadingHistory,
    hasMoreHistory,
    loadOlderMessages,
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
    cancelHistoryLoad,
  };
}
