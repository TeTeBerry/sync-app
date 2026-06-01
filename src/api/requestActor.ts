import { useCallback, useEffect, useMemo, useState } from 'react';
import { useDidShow } from '@tarojs/taro';
import {
  getClientUserId,
  getClientUserName,
  getClientUserPhone,
} from '../utils/session';
import { subscribeAuthSessionChange } from '../utils/authSession';
import {
  demoActorQueryParams,
  hasAuthenticatedRequest,
  mergeOwnerQueryParams,
  notificationQueryParams,
  ownerQueryParams,
  ownerQueryParamsWithActivity,
  resolveRequestUserId,
  type OwnerQueryParams,
} from './requestContext';

export type RequestActor = {
  isAuthenticated: boolean;
  userId: string;
  displayName: string;
  userPhone: string;
};

export {
  demoActorQueryParams,
  hasAuthenticatedRequest,
  mergeOwnerQueryParams,
  notificationQueryParams,
  ownerQueryParams,
  ownerQueryParamsWithActivity,
  resolveRequestUserId,
  type OwnerQueryParams,
};

/** Snapshot of REST/WS identity for the current client session. */
export function getRequestActor(): RequestActor {
  return {
    isAuthenticated: hasAuthenticatedRequest(),
    userId: getClientUserId(),
    displayName: getClientUserName(),
    userPhone: getClientUserPhone(),
  };
}

/** WebSocket `send` body identity — JWT on upgrade; demo uses body fields. */
export function buildAiChatWsSendActor(): {
  userId?: string;
  userName?: string;
  userPhone?: string;
} {
  const actor = getRequestActor();
  const phoneField = actor.userPhone.trim()
    ? { userPhone: actor.userPhone.trim() }
    : {};

  if (actor.isAuthenticated) {
    return phoneField;
  }

  return {
    userId: actor.userId,
    userName: actor.displayName,
    ...phoneField,
  };
}

/** Reactive `getRequestActor()` — refreshes on login/logout and tab show. */
export function useRequestActor(): RequestActor {
  const [revision, setRevision] = useState(0);

  const refresh = useCallback(() => {
    setRevision((n) => n + 1);
  }, []);

  useDidShow(() => {
    refresh();
  });

  useEffect(() => subscribeAuthSessionChange(refresh), [refresh]);

  return useMemo(() => getRequestActor(), [revision]);
}
