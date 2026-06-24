import Taro from '@tarojs/taro';
import { API_BASE_URL } from '../constants/api';
import { isWeappCloudRunTransportEnabled } from '../constants/cloud';
import type { ApiResponse } from '../types/backend';
import { handleApiUnauthorized } from '../api/handleApiUnauthorized';
import { getAccessToken, getAuthHeaders } from './authStorage';
import { getActivityScopeHeaders } from '../domains/activity-scope';
import { taroRequestData } from './apiRequestBody';
import {
  buildContainerApiPath,
  callContainerRequest,
  CALL_CONTAINER_MAX_BODY_BYTES,
  type ContainerHttpResponse,
} from './cloudRunTransport';
import { ApiAbortError, isApiAbortError } from './apiAbortError';

export { ApiAbortError, isApiAbortError } from './apiAbortError';

export class ApiError extends Error {
  constructor(
    message: string,
    readonly status?: number,
  ) {
    super(message);
    this.name = 'ApiError';
  }
}

const DEFAULT_TIMEOUT_MS = 10_000;
/** WeChat `request` ceiling; used for LLM-heavy itinerary generation. */
export const LONG_RUNNING_REQUEST_TIMEOUT_MS = 60_000;
const MAX_RETRIES = 2;
const RETRY_DELAY_MS = 300;

export type ApiFetchInit = RequestInit & {
  timeoutMs?: number;
  /** Default 2; use 0 for idempotent-sensitive POSTs (e.g. itinerary generate). */
  maxRetries?: number;
};

function splitFetchInit(init?: ApiFetchInit): {
  requestInit: RequestInit;
  timeoutMs: number;
  maxRetries: number;
} {
  const {
    timeoutMs = DEFAULT_TIMEOUT_MS,
    maxRetries = MAX_RETRIES,
    ...requestInit
  } = init ?? {};
  return { requestInit, timeoutMs, maxRetries };
}

function mergeHeaders(headers?: Record<string, string>): Record<string, string> {
  return {
    ...getAuthHeaders(),
    ...getActivityScopeHeaders(),
    ...(headers ?? {}),
  };
}

function buildUrl(path: string, params?: Record<string, string | undefined>): string {
  const normalizedPath = path.startsWith('/') ? path : `/${path}`;
  const base = API_BASE_URL.replace(/\/$/, '');
  let url = `${base}${normalizedPath}`;

  if (params) {
    const pairs: string[] = [];
    for (const [key, value] of Object.entries(params)) {
      if (value !== undefined && value !== '') {
        pairs.push(`${encodeURIComponent(key)}=${encodeURIComponent(value)}`);
      }
    }
    if (pairs.length > 0) {
      url += `${url.includes('?') ? '&' : '?'}${pairs.join('&')}`;
    }
  }

  return url;
}

type CompatibleResponse = ContainerHttpResponse;

async function requestWithTimeout(
  url: string,
  init: RequestInit,
  timeoutMs = DEFAULT_TIMEOUT_MS,
  signal?: AbortSignal,
): Promise<CompatibleResponse> {
  if (signal?.aborted) {
    throw new ApiAbortError();
  }

  return new Promise((resolve, reject) => {
    let settled = false;
    const requestHolder: { task?: ReturnType<typeof Taro.request> } = {};

    const finish = (fn: () => void) => {
      if (settled) return;
      settled = true;
      signal?.removeEventListener('abort', onAbort);
      fn();
    };

    const onAbort = () => {
      try {
        requestHolder.task?.abort?.();
      } catch {
        // ignore
      }
      finish(() => reject(new ApiAbortError()));
    };

    signal?.addEventListener('abort', onAbort);

    requestHolder.task = Taro.request({
      url,
      method: (init.method || 'GET') as keyof Taro.request.Method,
      header: init.headers as Record<string, string>,
      data: taroRequestData(init),
      timeout: timeoutMs,
      success: (res) => {
        finish(() => {
          resolve({
            ok: res.statusCode >= 200 && res.statusCode < 300,
            status: res.statusCode,
            json: async () => res.data,
          });
        });
      },
      fail: (err) => {
        const errMsg = err.errMsg || '请求失败';
        finish(() => {
          reject(isApiAbortError({ errMsg }) ? new ApiAbortError() : new Error(errMsg));
        });
      },
    });
  });
}

async function dispatchRequest(
  path: string,
  params: Record<string, string | undefined> | undefined,
  init: RequestInit,
  timeoutMs: number,
  signal?: AbortSignal,
): Promise<CompatibleResponse> {
  if (signal?.aborted) {
    throw new ApiAbortError();
  }

  if (isWeappCloudRunTransportEnabled()) {
    const requestData = taroRequestData(init);
    const bytes = requestData == null ? 0 : JSON.stringify(requestData).length;
    if (bytes > CALL_CONTAINER_MAX_BODY_BYTES && API_BASE_URL.startsWith('http')) {
      return requestWithTimeout(buildUrl(path, params), init, timeoutMs, signal);
    }
    return callContainerRequest(
      buildContainerApiPath(path, params),
      init,
      timeoutMs,
      signal,
    );
  }
  return requestWithTimeout(buildUrl(path, params), init, timeoutMs, signal);
}

async function sleep(ms: number): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

async function retryFetch(
  path: string,
  params: Record<string, string | undefined> | undefined,
  init?: ApiFetchInit,
): Promise<CompatibleResponse> {
  const { requestInit, timeoutMs, maxRetries } = splitFetchInit(init);
  const signal = requestInit.signal ?? undefined;
  let lastError: Error | undefined;

  for (let attempt = 0; attempt <= maxRetries; attempt += 1) {
    if (signal?.aborted) {
      throw new ApiAbortError();
    }
    try {
      const response = await dispatchRequest(
        path,
        params,
        requestInit,
        timeoutMs,
        signal,
      );
      return response;
    } catch (error) {
      if (isApiAbortError(error)) {
        throw error;
      }
      lastError = error instanceof Error ? error : new Error(String(error));

      if (attempt < maxRetries) {
        const delay = RETRY_DELAY_MS * 2 ** attempt;
        await sleep(delay);
      }
    }
  }

  const timeoutMessage = lastError?.message?.includes('timeout')
    ? '请求超时，请检查网络后重试'
    : lastError?.message || '网络请求失败，请稍后重试';
  throw new ApiError(timeoutMessage);
}

function parseEnvelopeMessage(json: unknown, fallback: string): string {
  if (json && typeof json === 'object' && 'message' in json) {
    const message = (json as ApiResponse<unknown>).message;
    if (typeof message === 'string' && message.trim()) {
      return message.trim();
    }
  }
  return fallback;
}

function maybeHandleUnauthorized(status: number, message: string): void {
  if (status === 401 && getAccessToken()) {
    handleApiUnauthorized(message);
  }
}

async function parseResponse<T>(response: CompatibleResponse): Promise<T> {
  const json = (await response.json()) as ApiResponse<T>;

  if (!response.ok) {
    const message = parseEnvelopeMessage(json, `请求失败 (${response.status})`);
    maybeHandleUnauthorized(response.status, message);
    throw new ApiError(message, response.status);
  }

  if (json.code !== 200) {
    const message = json.message || '请求失败';
    maybeHandleUnauthorized(json.code, message);
    throw new ApiError(message, json.code);
  }

  return json.data;
}

export async function apiGet<T>(
  path: string,
  params?: Record<string, string | undefined>,
  init?: ApiFetchInit,
): Promise<T> {
  const { headers: extraHeaders, ...restInit } = init ?? {};
  const response = await retryFetch(path, params, {
    method: 'GET',
    headers: mergeHeaders({
      Accept: 'application/json',
      ...(extraHeaders as Record<string, string> | undefined),
    }),
    ...restInit,
  });

  return parseResponse<T>(response);
}

export async function apiPost<T>(
  path: string,
  body: unknown,
  params?: Record<string, string | undefined>,
  init?: ApiFetchInit,
): Promise<T> {
  const { headers: extraHeaders, ...restInit } = init ?? {};
  const response = await retryFetch(path, params, {
    method: 'POST',
    headers: mergeHeaders({
      Accept: 'application/json',
      'Content-Type': 'application/json',
      ...(extraHeaders as Record<string, string> | undefined),
    }),
    body: JSON.stringify(body),
    ...restInit,
  });

  return parseResponse<T>(response);
}

export async function apiPatch<T>(
  path: string,
  body: unknown,
  params?: Record<string, string | undefined>,
  init?: ApiFetchInit,
): Promise<T> {
  const { headers: extraHeaders, ...restInit } = init ?? {};
  const response = await retryFetch(path, params, {
    method: 'PATCH',
    headers: mergeHeaders({
      Accept: 'application/json',
      'Content-Type': 'application/json',
      ...(extraHeaders as Record<string, string> | undefined),
    }),
    body: JSON.stringify(body),
    ...restInit,
  });

  return parseResponse<T>(response);
}

export async function apiDelete<T>(
  path: string,
  params?: Record<string, string | undefined>,
  init?: ApiFetchInit,
): Promise<T> {
  const { headers: extraHeaders, ...restInit } = init ?? {};
  const response = await retryFetch(path, params, {
    method: 'DELETE',
    headers: mergeHeaders({
      Accept: 'application/json',
      ...(extraHeaders as Record<string, string> | undefined),
    }),
    ...restInit,
  });

  return parseResponse<T>(response);
}
