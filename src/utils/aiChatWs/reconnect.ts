import { AUTH_SESSION_EXPIRED_MESSAGE } from '../../constants/authMessages';

/** Max connect attempts in pool (`ensureWsPool`) — initial try + retries. */
export const WS_CONNECT_RETRY_MAX = 2;

export const WS_CONNECT_RETRY_BASE_MS = 400;

/** Extra full-turn attempts after the first failure (zero events only). */
export const WS_TURN_RETRY_MAX = 1;

export function wsReconnectDelayMs(attempt: number): number {
  return WS_CONNECT_RETRY_BASE_MS * 2 ** attempt;
}

export function isAuthSessionErrorMessage(message: string): boolean {
  const normalized = message.trim();
  return (
    normalized.includes(AUTH_SESSION_EXPIRED_MESSAGE) ||
    normalized.includes('登录已过期') ||
    normalized.includes('用户身份与登录态不一致')
  );
}

/** Whether a failed WS turn may be retried automatically. */
export function isWsTurnRetryableError(error: unknown, sawAnyEvent: boolean): boolean {
  if (sawAnyEvent) return false;
  if (error instanceof Error && error.name === 'AbortError') return false;
  const message = error instanceof Error ? error.message : String(error);
  if (isAuthSessionErrorMessage(message)) return false;
  return true;
}

/** User-facing hint when partial stream was received (no auto-retry). */
export function appendPartialStreamRetryHint(message: string): string {
  const trimmed = message.trim();
  if (!trimmed) return '连接中断，请重新发送';
  if (trimmed.includes('重新发送')) return trimmed;
  return `${trimmed}（可重新发送）`;
}
