import { ApiError } from './apiClient';

/** Surfaces server message from ApiError (e.g. 409 已举报 / 已拉黑). */
export function getApiErrorMessage(error: unknown, fallback: string): string {
  if (error instanceof ApiError) {
    const message = error.message?.trim();
    if (message) return message;
  }
  if (error instanceof Error) {
    const message = error.message?.trim();
    if (message) return message;
  }
  return fallback;
}
