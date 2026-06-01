/** Aligns with backend `AUTH_SESSION_EXPIRED_MESSAGE`. */
export const AUTH_SESSION_EXPIRED_MESSAGE = '登录已过期，请重新登录';

export function isAuthSessionExpiredMessage(message?: string | null): boolean {
  const trimmed = message?.trim();
  return Boolean(trimmed && trimmed === AUTH_SESSION_EXPIRED_MESSAGE);
}
