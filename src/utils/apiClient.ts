import Taro from "@tarojs/taro";
import { API_BASE_URL } from "../constants/api";
import type { ApiResponse } from "../types/backend";
import { taroRequestData } from "./apiRequestBody";

export class ApiError extends Error {
  constructor(
    message: string,
    readonly status?: number,
  ) {
    super(message);
    this.name = "ApiError";
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

function buildUrl(path: string, params?: Record<string, string | undefined>): string {
  const normalizedPath = path.startsWith("/") ? path : `/${path}`;
  const base = API_BASE_URL.replace(/\/$/, "");
  let url = `${base}${normalizedPath}`;

  if (params) {
    const pairs: string[] = [];
    for (const [key, value] of Object.entries(params)) {
      if (value !== undefined && value !== "") {
        pairs.push(`${encodeURIComponent(key)}=${encodeURIComponent(value)}`);
      }
    }
    if (pairs.length > 0) {
      url += `${url.includes("?") ? "&" : "?"}${pairs.join("&")}`;
    }
  }

  return url;
}

interface CompatibleResponse {
  ok: boolean;
  status: number;
  json(): Promise<unknown>;
}

async function requestWithTimeout(
  url: string,
  init: RequestInit,
  timeoutMs = DEFAULT_TIMEOUT_MS,
): Promise<CompatibleResponse> {
  return new Promise((resolve, reject) => {
    Taro.request({
      url,
      method: (init.method || "GET") as keyof Taro.request.Method,
      header: init.headers as Record<string, string>,
      data: taroRequestData(init),
      timeout: timeoutMs,
      success: (res) => {
        resolve({
          ok: res.statusCode >= 200 && res.statusCode < 300,
          status: res.statusCode,
          json: async () => res.data,
        });
      },
      fail: (err) => {
        reject(new Error(err.errMsg || "请求失败"));
      },
    });
  });
}

async function sleep(ms: number): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

async function retryFetch(
  url: string,
  init?: ApiFetchInit,
): Promise<CompatibleResponse> {
  const { requestInit, timeoutMs, maxRetries } = splitFetchInit(init);
  let lastError: Error | undefined;

  for (let attempt = 0; attempt <= maxRetries; attempt += 1) {
    try {
      // eslint-disable-next-line no-console
      console.log(`[API] ${requestInit.method ?? "GET"} ${url}`);
      const response = await requestWithTimeout(url, requestInit, timeoutMs);
      // eslint-disable-next-line no-console
      console.log(`[API] ${requestInit.method ?? "GET"} ${url} -> ${response.status}`);
      return response;
    } catch (error) {
      lastError = error instanceof Error ? error : new Error(String(error));
      // eslint-disable-next-line no-console
      console.error(`[API] ${requestInit.method ?? "GET"} ${url} error:`, lastError.message);

      if (lastError.message?.includes("timeout")) {
        throw new ApiError("请求超时，请检查网络后重试");
      }

      if (attempt < maxRetries) {
        const delay = RETRY_DELAY_MS * 2 ** attempt;
        await sleep(delay);
      }
    }
  }

  throw new ApiError(lastError?.message || "网络请求失败，请稍后重试");
}

async function parseResponse<T>(response: CompatibleResponse): Promise<T> {
  if (!response.ok) {
    throw new ApiError(`请求失败 (${response.status})`, response.status);
  }

  const json = (await response.json()) as ApiResponse<T>;
  if (json.code !== 200) {
    throw new ApiError(json.message || "请求失败", json.code);
  }

  return json.data;
}

export async function apiGet<T>(
  path: string,
  params?: Record<string, string | undefined>,
  init?: ApiFetchInit,
): Promise<T> {
  const response = await retryFetch(buildUrl(path, params), {
    method: "GET",
    headers: {
      Accept: "application/json",
      ...init?.headers,
    },
    ...init,
  });

  return parseResponse<T>(response);
}

export async function apiPost<T>(
  path: string,
  body: unknown,
  params?: Record<string, string | undefined>,
  init?: ApiFetchInit,
): Promise<T> {
  const response = await retryFetch(buildUrl(path, params), {
    method: "POST",
    headers: {
      Accept: "application/json",
      "Content-Type": "application/json",
      ...init?.headers,
    },
    body: JSON.stringify(body),
    ...init,
  });

  return parseResponse<T>(response);
}

export async function apiPatch<T>(
  path: string,
  body: unknown,
  params?: Record<string, string | undefined>,
  init?: ApiFetchInit,
): Promise<T> {
  const response = await retryFetch(buildUrl(path, params), {
    method: "PATCH",
    headers: {
      Accept: "application/json",
      "Content-Type": "application/json",
      ...init?.headers,
    },
    body: JSON.stringify(body),
    ...init,
  });

  return parseResponse<T>(response);
}

export async function apiDelete<T>(
  path: string,
  params?: Record<string, string | undefined>,
  init?: ApiFetchInit,
): Promise<T> {
  const response = await retryFetch(buildUrl(path, params), {
    method: "DELETE",
    headers: {
      Accept: "application/json",
      ...init?.headers,
    },
    ...init,
  });

  return parseResponse<T>(response);
}
