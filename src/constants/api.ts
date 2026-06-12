/** Taro injects `process.env.TARO_*` at compile time; avoid `typeof process` guards. */
const rawBase =
  process.env.TARO_APP_API_BASE_URL || (process.env.TARO_ENV === 'h5' ? '/api' : '');

/** REST API root, e.g. `https://api.example.com` (weapp) or `/api` (unmaintained H5 dev). */
export const API_BASE_URL = rawBase.replace(/\/$/, '');

const AI_CHAT_WS_SUFFIX = '/ai/chat/ws';
const AI_CHAT_WS_CANONICAL_SUFFIX = '/api/ai/chat/ws';
const LEGACY_AI_CHAT_WS_SUFFIX = '/ai-chat';

function normalizeAiChatWsUrl(url: string): string {
  const trimmed = url.replace(/\/$/, '');
  if (trimmed.endsWith(LEGACY_AI_CHAT_WS_SUFFIX)) {
    const corrected = trimmed.replace(
      new RegExp(`${LEGACY_AI_CHAT_WS_SUFFIX.replace('/', '\\/')}$`),
      AI_CHAT_WS_CANONICAL_SUFFIX,
    );
    if (process.env.NODE_ENV !== 'production') {
      console.warn(
        `[SYNC AI WS] WebSocket URL used legacy ${LEGACY_AI_CHAT_WS_SUFFIX}; normalized to ${AI_CHAT_WS_CANONICAL_SUFFIX}`,
      );
    }
    return corrected;
  }
  return trimmed;
}

function httpBaseToWs(base: string): string {
  if (base.startsWith('https://')) {
    return `wss://${base.slice('https://'.length)}`;
  }
  if (base.startsWith('http://')) {
    return `ws://${base.slice('http://'.length)}`;
  }
  return '';
}

/** WebSocket AI chat; `TARO_APP_AI_CHAT_WS_URL` or derived from `TARO_APP_API_BASE_URL`. */
export function resolveAiChatWsUrl(): string {
  const explicit = (
    process.env.TARO_APP_AI_CHAT_WS_URL ||
    process.env.TARO_APP_WS_URL ||
    ''
  ).trim();
  if (explicit) {
    return normalizeAiChatWsUrl(explicit);
  }

  const apiBase = API_BASE_URL;
  if (!apiBase) return '';

  const wsBase = httpBaseToWs(apiBase);
  if (wsBase) {
    const root = wsBase.replace(/\/$/, '');
    const httpRoot = apiBase.replace(/\/$/, '');
    const suffix = httpRoot.endsWith('/api')
      ? AI_CHAT_WS_SUFFIX
      : AI_CHAT_WS_CANONICAL_SUFFIX;
    return `${root}${suffix}`;
  }

  return '';
}

export const AI_CHAT_WS_URL = resolveAiChatWsUrl();

export function isApiEnabled(): boolean {
  return Boolean(API_BASE_URL || AI_CHAT_WS_URL);
}

/** Whether list/profile/chat hooks should fetch from the backend. */
export function isLiveApi(): boolean {
  return isApiEnabled();
}
