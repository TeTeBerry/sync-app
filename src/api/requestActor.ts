import { useCallback, useEffect, useMemo, useState } from 'react';
import { useDidShow } from '@tarojs/taro';
import {
  getClientUserId,
  getClientUserName,
  getClientUserPhone,
} from '../utils/session';
import { subscribeAuthSessionChange } from '../utils/authSession';
import {
  hasAuthenticatedRequest,
  mergeOwnerQueryParams,
  notificationQueryParams,
  ownerQueryParams,
  resolveRequestUserId,
  type OwnerQueryParams,
} from './requestContext';

/**
 * Client-side session identity (JWT or anonymous). Not the backend `RequestActor`
 * (`source` / `clientUserId` / `resolvedUserId`).
 */
export type ClientSessionIdentity = {
  isAuthenticated: boolean;
  userId: string;
  displayName: string;
  userPhone: string;
};

export {
  hasAuthenticatedRequest,
  mergeOwnerQueryParams,
  notificationQueryParams,
  ownerQueryParams,
  resolveRequestUserId,
  type OwnerQueryParams,
};

export function getClientSessionIdentity(): ClientSessionIdentity {
  return {
    isAuthenticated: hasAuthenticatedRequest(),
    userId: getClientUserId(),
    displayName: getClientUserName(),
    userPhone: getClientUserPhone(),
  };
}

/** WebSocket `send` body identity — JWT on upgrade; anonymous uses body fields. */
export function buildAiChatWsSendActor(): {
  userId?: string;
  userName?: string;
  userPhone?: string;
} {
  const identity = getClientSessionIdentity();
  const phoneField = identity.userPhone.trim()
    ? { userPhone: identity.userPhone.trim() }
    : {};

  if (identity.isAuthenticated) {
    return phoneField;
  }

  return {
    userId: identity.userId,
    userName: identity.displayName,
    ...phoneField,
  };
}

export function useClientSessionIdentity(): ClientSessionIdentity {
  const [revision, setRevision] = useState(0);

  const refresh = useCallback(() => {
    setRevision((n) => n + 1);
  }, []);

  useDidShow(() => {
    refresh();
  });

  useEffect(() => subscribeAuthSessionChange(refresh), [refresh]);

  return useMemo(() => {
    void revision;
    return getClientSessionIdentity();
  }, [revision]);
}
