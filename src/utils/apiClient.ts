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
  const response = await fetch(buildUrl(path, params), {
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
  init?: RequestInit,
): Promise<T> {
  const response = await fetch(buildUrl(path), {
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

export async function apiDelete<T>(
  path: string,
  params?: Record<string, string | undefined>,
  init?: RequestInit,
): Promise<T> {
  const response = await fetch(buildUrl(path, params), {
    method: "DELETE",
    headers: {
      Accept: "application/json",
      ...init?.headers,
    },
    ...init,
  });

  return parseResponse<T>(response);
}
