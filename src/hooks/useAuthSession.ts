import { useCallback, useEffect, useMemo, useState } from 'react';
import { useDidShow } from '@tarojs/taro';
import { subscribeAuthSessionChange } from '../utils/authSession';
import { getAuthUser, isLoggedIn } from '../utils/authStorage';

/**
 * Reads auth from storage and refreshes on tab show (e.g. after login / logout).
 */
export function useAuthSession() {
  const [revision, setRevision] = useState(0);

  const refresh = useCallback(() => {
    setRevision((n) => n + 1);
  }, []);

  useDidShow(() => {
    refresh();
  });

  useEffect(() => subscribeAuthSessionChange(refresh), [refresh]);

  const loggedIn = useMemo(() => isLoggedIn(), [revision]);
  const user = useMemo(() => (loggedIn ? getAuthUser() : null), [loggedIn, revision]);

  return { loggedIn, user, refresh };
}
