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

/**
 * Client-side session identity (JWT or demo). Not the backend `RequestActor`
 * (`source` / `clientUserId` / `resolvedUserId`).
 */
export type ClientSessionIdentity = {
  isAuthenticated: boolean;
  userId: string;
  displayName: string;
  userPhone: string;
};

/** @deprecated Use `ClientSessionIdentity` — collides with backend `RequestActor`. */
export type RequestActor = ClientSessionIdentity;

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

export function getClientSessionIdentity(): ClientSessionIdentity {
  return {
    isAuthenticated: hasAuthenticatedRequest(),
    userId: getClientUserId(),
    displayName: getClientUserName(),
    userPhone: getClientUserPhone(),
  };
}

/** @deprecated Use `getClientSessionIdentity`. */
export const getRequestActor = getClientSessionIdentity;

/** WebSocket `send` body identity — JWT on upgrade; demo uses body fields. */
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

  return useMemo(() => getClientSessionIdentity(), [revision]);
}

/** @deprecated Use `useClientSessionIdentity`. */
export const useRequestActor = useClientSessionIdentity;
