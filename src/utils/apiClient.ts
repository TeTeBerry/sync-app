import { API_BASE_URL } from "../constants/api";
import type { ApiResponse } from "../types/backend";

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
const MAX_RETRIES = 2;
const RETRY_DELAY_MS = 300;

function buildUrl(path: string, params?: Record<string, string | undefined>): string {
  const normalizedPath = path.startsWith("/") ? path : `/${path}`;
  const base = API_BASE_URL.replace(/\/$/, "");
  const combined = `${base}${normalizedPath}`;

  const url =
    base.startsWith("http://") || base.startsWith("https://")
      ? new URL(combined)
      : new URL(
          combined,
          typeof window !== "undefined" ? window.location.origin : "http://localhost",
        );

  if (params) {
    for (const [key, value] of Object.entries(params)) {
      if (value !== undefined && value !== "") {
        url.searchParams.set(key, value);
      }
    }
  }

  return url.toString();
}

async function fetchWithTimeout(
  url: string,
  init: RequestInit,
  timeoutMs = DEFAULT_TIMEOUT_MS,
): Promise<Response> {
  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), timeoutMs);

  try {
    const response = await fetch(url, {
      ...init,
      signal: controller.signal,
    });
    return response;
  } finally {
    clearTimeout(timeoutId);
  }
}

async function sleep(ms: number): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

async function retryFetch(
  url: string,
  init: RequestInit,
  retries = MAX_RETRIES,
): Promise<Response> {
  let lastError: Error | undefined;

  for (let attempt = 0; attempt <= retries; attempt += 1) {
    try {
      return await fetchWithTimeout(url, init);
    } catch (error) {
      lastError = error instanceof Error ? error : new Error(String(error));

      // 不重试用户取消的请求
      if (lastError.name === "AbortError") {
        throw new ApiError("请求超时，请检查网络后重试");
      }

      if (attempt < retries) {
        const delay = RETRY_DELAY_MS * 2 ** attempt;
        await sleep(delay);
      }
    }
  }

  throw new ApiError(lastError?.message || "网络请求失败，请稍后重试");
}

async function parseResponse<T>(response: Response): Promise<T> {
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
  init?: RequestInit,
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
  init?: RequestInit,
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
  init?: RequestInit,
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
  init?: RequestInit,
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
