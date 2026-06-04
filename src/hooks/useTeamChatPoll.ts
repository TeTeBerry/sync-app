import { useCallback, useEffect, useRef } from 'react';
import { useDidHide, useDidShow } from '@tarojs/taro';
import { isApiEnabled } from '../constants/api';
import { TEAM_CHAT_POLL_INTERVAL_MS } from '../constants/queryCache';

type RefetchFn = (options?: { background?: boolean }) => void | Promise<unknown>;

/**
 * Poll team chat messages while the chat page is visible.
 * Pauses on page hide / unmount to avoid background traffic.
 */
export function useTeamChatPoll(options: {
  /** Thread ids resolved — do not poll without a valid session. */
  pollEnabled: boolean;
  /** When true, refresh uses background fetch (no full-page loading). */
  hasCachedMessages?: boolean;
  refetchMessages: RefetchFn;
  /** Optional session refetch (e.g. `canSendMessage` after owner replies). */
  refetchSession?: RefetchFn;
}) {
  const {
    pollEnabled,
    hasCachedMessages = false,
    refetchMessages,
    refetchSession,
  } = options;
  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const pageVisibleRef = useRef(false);
  const apiEnabled = isApiEnabled();

  const clearPoll = useCallback(() => {
    if (intervalRef.current != null) {
      clearInterval(intervalRef.current);
      intervalRef.current = null;
    }
  }, []);

  const startPoll = useCallback(() => {
    clearPoll();
    if (!apiEnabled || !pollEnabled) return;

    intervalRef.current = setInterval(() => {
      void refetchMessages({ background: true });
      void refetchSession?.({ background: true });
    }, TEAM_CHAT_POLL_INTERVAL_MS);
  }, [apiEnabled, clearPoll, pollEnabled, refetchMessages, refetchSession]);

  const refreshNow = useCallback(() => {
    if (!apiEnabled || !pollEnabled) return;
    void refetchMessages({ background: hasCachedMessages });
    void refetchSession?.({ background: true });
  }, [apiEnabled, hasCachedMessages, pollEnabled, refetchMessages, refetchSession]);

  useDidShow(() => {
    pageVisibleRef.current = true;
    if (!apiEnabled || !pollEnabled) return;
    refreshNow();
    startPoll();
  });

  useDidHide(() => {
    pageVisibleRef.current = false;
    clearPoll();
  });

  useEffect(() => {
    if (!pageVisibleRef.current || !apiEnabled || !pollEnabled) {
      return clearPoll;
    }
    refreshNow();
    startPoll();
    return clearPoll;
  }, [apiEnabled, clearPoll, pollEnabled, refreshNow, startPoll]);

  return { refreshNow, clearPoll };
}
