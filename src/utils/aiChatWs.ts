import Taro from '@tarojs/taro';
import { resolveAiChatWsUrl } from '../constants/api';
import type { AiChatMessage, AiChatStreamEvent } from '../types/aiChat';
import { parseStreamEventPayload } from './aiChatStreamEvents';

const LOG_PREFIX = '[SYNC AI WS]';

/** Key lifecycle events — use console.warn so they stay visible in WeChat DevTools. */
const WS_LOG_WARN_EVENTS = new Set([
  'stream start',
  'connecting',
  'onOpen',
  'onClose',
  'onError',
  'server error frame',
]);

/**
 * True when Taro compiles with webpack `development` mode (`npm run dev:weapp`).
 * `npm run build:weapp` uses production mode and strips these logs at compile time.
 */
export function isAiChatWsDevLog(): boolean {
  return process.env.NODE_ENV !== 'production';
}

export function logAiChatWsResolvedUrl(context: string): void {
  if (!isAiChatWsDevLog()) return;
  console.warn(`${LOG_PREFIX} ${context}`, {
    wsUrl: resolveAiChatWsUrl(),
    taroEnv: process.env.TARO_ENV,
    nodeEnv: process.env.NODE_ENV,
  });
}

function wsLog(message: string, detail?: unknown, forceWarn = false): void {
  if (!isAiChatWsDevLog()) return;
  const line = `${LOG_PREFIX} ${message}`;
  const emit =
    forceWarn || WS_LOG_WARN_EVENTS.has(message) ? console.warn : console.log;
  if (detail === undefined) {
    emit(line);
    return;
  }
  emit(line, detail);
}

function devLog(message: string, detail?: unknown): void {
  wsLog(message, detail);
}

function devLogWarn(message: string, detail?: unknown): void {
  wsLog(message, detail, true);
}

function describeRawWsData(raw: unknown): string {
  if (raw === null || raw === undefined) return String(raw);
  if (typeof raw === 'string') return `string(len=${raw.length})`;
  if (raw instanceof ArrayBuffer) return `ArrayBuffer(byteLength=${raw.byteLength})`;
  if (ArrayBuffer.isView(raw)) {
    return `${raw.constructor.name}(byteLength=${raw.byteLength})`;
  }
  if (typeof raw === 'object')
    return `object(keys=${Object.keys(raw as object).join(',')})`;
  return typeof raw;
}

function previewDecodedText(text: string, max = 160): string {
  const oneLine = text.replace(/\s+/g, ' ').trim();
  return oneLine.length <= max ? oneLine : `${oneLine.slice(0, max)}…`;
}

export interface AiChatWsSendPayload {
  messages: AiChatMessage[];
  sessionId?: string;
  userId?: string;
  userName?: string;
  userPhone?: string;
  activityLegacyId?: number;
  image?: string;
  images?: string[];
}

export interface StreamAiChatWsOptions extends AiChatWsSendPayload {
  url?: string;
  headers?: Record<string, string>;
  signal?: AbortSignal;
}

type QueueItem =
  | { kind: 'event'; event: AiChatStreamEvent }
  | { kind: 'error'; error: Error }
  | { kind: 'close' };

function createEventQueue() {
  const pending: QueueItem[] = [];
  let resolveNext: ((item: QueueItem) => void) | null = null;

  const push = (item: QueueItem) => {
    if (resolveNext) {
      const resolve = resolveNext;
      resolveNext = null;
      resolve(item);
      return;
    }
    pending.push(item);
  };

  const nextItem = (): Promise<QueueItem> => {
    const existing = pending.shift();
    if (existing) return Promise.resolve(existing);
    return new Promise((resolve) => {
      resolveNext = resolve;
    });
  };

  return { push, nextItem };
}

const WS_CONNECT_TIMEOUT_MS = 12_000;
const WS_CONNECTED_ACK_TIMEOUT_MS = 5_000;
const WS_RECONNECT_MAX = 2;
const WS_RECONNECT_BASE_MS = 400;

type PooledConnection = {
  wsUrl: string;
  headersKey: string;
  task: Taro.SocketTask;
  activeTurn: {
    queue: ReturnType<typeof createEventQueue>;
    settleConnected: (action: 'resolve' | 'reject', error?: Error) => void;
    connectedSettled: boolean;
    connectedTimer: ReturnType<typeof setTimeout>;
  } | null;
};

let wsPool: PooledConnection | null = null;

function headersKey(headers?: Record<string, string>): string {
  if (!headers) return '';
  return JSON.stringify(
    Object.keys(headers)
      .sort()
      .map((k) => [k, headers[k]]),
  );
}

function sleep(ms: number): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

export function closeAiChatWsConnection(reason = 'client close'): void {
  if (!wsPool) return;
  try {
    wsPool.task.close({ code: 1000, reason });
  } catch {
    // ignore
  }
  wsPool.activeTurn?.queue.push({ kind: 'close' });
  wsPool = null;
}

function attachPoolListeners(connection: PooledConnection): void {
  bindSocketListeners(connection.task, {
    onMessage: (res) => {
      const turn = connection.activeTurn;
      if (!turn) return;

      const rawKind = describeRawWsData(res.data);
      const raw = decodeWsMessageData(res.data);
      if (!raw) {
        devLog('onMessage ignored', { rawKind });
        return;
      }

      let json: Record<string, unknown>;
      try {
        json = JSON.parse(raw) as Record<string, unknown>;
      } catch {
        devLog('onMessage invalid JSON', {
          rawKind,
          preview: previewDecodedText(raw),
        });
        turn.queue.push({
          kind: 'error',
          error: new Error('AI chat WebSocket 收到无效 JSON'),
        });
        return;
      }

      devLog('onMessage', {
        rawKind,
        type: typeof json.type === 'string' ? json.type : undefined,
        preview: previewDecodedText(raw),
      });

      if (json.type === 'connected') {
        if (!turn.connectedSettled) {
          turn.connectedSettled = true;
          clearTimeout(turn.connectedTimer);
          turn.settleConnected('resolve');
        }
        return;
      }

      if (typeof json.code === 'number' && 'data' in json && !('type' in json)) {
        devLog('onMessage REST envelope (wrong endpoint?)', {
          code: json.code,
          message: json.message,
        });
        return;
      }

      if (
        typeof json.sessionId === 'string' &&
        Array.isArray(json.history) &&
        !('type' in json)
      ) {
        devLog('onMessage session snapshot (not a stream frame)', {
          sessionId: json.sessionId,
        });
        return;
      }

      if (json.type === 'error' && typeof json.message === 'string') {
        devLog('server error frame', { message: json.message });
      }

      const event = parseStreamEventPayload(json);
      if (event) {
        devLog('stream event', { type: event.type });
        turn.queue.push({ kind: 'event', event });
        return;
      }

      if (json.type === 'error' && typeof json.message === 'string') {
        turn.queue.push({
          kind: 'event',
          event: { type: 'error', message: json.message },
        });
      }
    },
    onClose: (res) => {
      devLog('onClose', {
        code: res?.code,
        reason: res?.reason,
      });
      const turn = connection.activeTurn;
      if (turn && !turn.connectedSettled) {
        turn.settleConnected('reject', new Error('WebSocket 连接已关闭'));
      }
      turn?.queue.push({ kind: 'close' });
      wsPool = null;
    },
    onError: (err) => {
      devLog('onError', { errMsg: err.errMsg });
      const turn = connection.activeTurn;
      if (turn && !turn.connectedSettled) {
        turn.settleConnected('reject', new Error(err.errMsg || 'WebSocket 连接异常'));
      }
      turn?.queue.push({
        kind: 'error',
        error: new Error(err.errMsg || 'WebSocket 连接异常'),
      });
      wsPool = null;
    },
  });
}

async function ensureWsPool(
  wsUrl: string,
  headers?: Record<string, string>,
): Promise<PooledConnection> {
  const key = headersKey(headers);
  if (wsPool && wsPool.wsUrl === wsUrl && wsPool.headersKey === key) {
    return wsPool;
  }

  if (wsPool) {
    try {
      wsPool.task.close({ code: 1000, reason: 'reconnect' });
    } catch {
      // ignore
    }
    wsPool = null;
  }

  let lastError: Error | undefined;
  for (let attempt = 0; attempt <= WS_RECONNECT_MAX; attempt += 1) {
    try {
      devLogWarn('connecting', { url: wsUrl, attempt });
      const task = await connectSocket(wsUrl, headers);
      const connection: PooledConnection = {
        wsUrl,
        headersKey: key,
        task,
        activeTurn: null,
      };
      attachPoolListeners(connection);
      wsPool = connection;
      devLogWarn('onOpen', { url: wsUrl });
      return connection;
    } catch (error) {
      lastError = error instanceof Error ? error : new Error(String(error));
      if (attempt < WS_RECONNECT_MAX) {
        await sleep(WS_RECONNECT_BASE_MS * 2 ** attempt);
      }
    }
  }

  throw lastError ?? new Error('WebSocket 连接失败');
}

/** WeChat miniprogram often delivers WebSocket frames as ArrayBuffer, not string. */
export function decodeWsMessageData(raw: unknown): string | null {
  if (typeof raw === 'string') return raw;
  if (ArrayBuffer.isView(raw)) {
    return decodeWsMessageData(
      raw.buffer.slice(raw.byteOffset, raw.byteOffset + raw.byteLength),
    );
  }
  if (raw instanceof ArrayBuffer) {
    try {
      return new TextDecoder('utf-8').decode(raw);
    } catch {
      const bytes = new Uint8Array(raw);
      let latin1 = '';
      for (let i = 0; i < bytes.length; i += 1) {
        latin1 += String.fromCharCode(bytes[i]);
      }
      try {
        return decodeURIComponent(escape(latin1));
      } catch {
        return latin1;
      }
    }
  }
  if (raw !== null && typeof raw === 'object') {
    try {
      return JSON.stringify(raw);
    } catch {
      return null;
    }
  }
  return null;
}

/** Taro 4 connectSocket returns Promise<SocketTask>; older runtimes may return the task directly. */
async function resolveConnectSocketTask(
  result: Taro.SocketTask | Promise<Taro.SocketTask>,
): Promise<Taro.SocketTask> {
  if (result && typeof (result as Promise<Taro.SocketTask>).then === 'function') {
    return result as Promise<Taro.SocketTask>;
  }
  return result as Taro.SocketTask;
}

type SocketMessageHandler = (res: { data: unknown }) => void;
type SocketCloseHandler = (res?: { code?: number; reason?: string }) => void;
type SocketErrorHandler = (err: { errMsg?: string }) => void;

function bindSocketListeners(
  task: Taro.SocketTask,
  handlers: {
    onMessage: SocketMessageHandler;
    onClose: SocketCloseHandler;
    onError: SocketErrorHandler;
  },
): void {
  if (typeof task.onMessage === 'function') {
    task.onMessage(handlers.onMessage);
    task.onClose(handlers.onClose);
    task.onError(handlers.onError);
    return;
  }
  Taro.onSocketMessage(handlers.onMessage);
  Taro.onSocketClose(handlers.onClose);
  Taro.onSocketError(handlers.onError);
}

function connectSocket(
  url: string,
  headers?: Record<string, string>,
): Promise<Taro.SocketTask> {
  return new Promise((resolve, reject) => {
    void (async () => {
      let task: Taro.SocketTask;
      try {
        task = await resolveConnectSocketTask(
          Taro.connectSocket({ url, header: headers }),
        );
      } catch (err) {
        const message = err instanceof Error ? err.message : 'WebSocket 连接失败';
        reject(new Error(message));
        return;
      }

      let settled = false;

      const fail = (message: string) => {
        if (settled) return;
        settled = true;
        clearTimeout(connectTimer);
        reject(new Error(message));
      };

      const connectTimer = setTimeout(() => {
        const hint = isAiChatWsDevLog()
          ? `（请确认地址为 …/api/ai/chat/ws，当前: ${url}）`
          : '';
        fail(`WebSocket 连接超时${hint}`);
        try {
          task.close({ code: 1000, reason: 'connect timeout' });
        } catch {
          // ignore
        }
      }, WS_CONNECT_TIMEOUT_MS);

      const onOpen = () => {
        if (settled) return;
        settled = true;
        clearTimeout(connectTimer);
        resolve(task);
      };
      const onConnectError = (err: { errMsg?: string }) => {
        fail(err.errMsg || 'WebSocket 连接失败');
      };

      if (typeof task.onOpen === 'function') {
        task.onOpen(onOpen);
        task.onError(onConnectError);
        return;
      }

      // Legacy weapp: single global socket; listeners must be registered after connectSocket.
      Taro.onSocketOpen(onOpen);
      Taro.onSocketError(onConnectError);
    })();
  });
}

function sendJson(task: Taro.SocketTask, payload: unknown): Promise<void> {
  const body = JSON.stringify(payload);
  devLog('send', {
    type:
      payload && typeof payload === 'object' && 'type' in payload
        ? (payload as { type?: string }).type
        : undefined,
    bytes: body.length,
    preview: previewDecodedText(body, 120),
  });
  return new Promise((resolve, reject) => {
    task.send({
      data: body,
      success: () => resolve(),
      fail: (err) => reject(new Error(err.errMsg || 'WebSocket 发送失败')),
    });
  });
}

export async function* streamAiChatWs(
  options: StreamAiChatWsOptions,
): AsyncGenerator<AiChatStreamEvent> {
  devLogWarn('stream start', {
    taroEnv: process.env.TARO_ENV,
    nodeEnv: process.env.NODE_ENV,
    hasSessionId: Boolean(options.sessionId),
    messageCount: options.messages.length,
  });

  const wsUrl = (options.url?.trim() || resolveAiChatWsUrl()).trim();
  if (!wsUrl) {
    throw new Error('AI chat WebSocket URL is not configured');
  }
  if (wsUrl.includes('/chat/sessions')) {
    throw new Error(
      'AI WebSocket 地址配置错误：不能指向 /chat/sessions，请使用 …/api/ai/chat/ws',
    );
  }
  if (process.env.TARO_ENV === 'weapp' && wsUrl.startsWith('/')) {
    throw new Error(
      '小程序需配置完整 WebSocket 地址（TARO_APP_WS_URL 或 TARO_APP_API_BASE_URL）',
    );
  }

  const queue = createEventQueue();

  const onAbort = () => {
    queue.push({ kind: 'close' });
    closeAiChatWsConnection('aborted');
  };

  options.signal?.addEventListener('abort', onAbort, { once: true });

  let resolveConnected: (() => void) | null = null;
  let rejectConnected: ((error: Error) => void) | null = null;
  const connectedReady = new Promise<void>((resolve, reject) => {
    resolveConnected = resolve;
    rejectConnected = reject;
  });
  const connectedTimer = setTimeout(() => {
    activeTurn?.settleConnected(
      'reject',
      new Error('WebSocket 未收到 connected 确认，请稍后重试'),
    );
  }, WS_CONNECTED_ACK_TIMEOUT_MS);

  const activeTurn: NonNullable<PooledConnection['activeTurn']> = {
    queue,
    connectedSettled: false,
    connectedTimer,
    settleConnected: (action, error) => {
      if (activeTurn.connectedSettled) return;
      activeTurn.connectedSettled = true;
      clearTimeout(activeTurn.connectedTimer);
      if (action === 'resolve') {
        resolveConnected?.();
      } else {
        rejectConnected?.(error ?? new Error('WebSocket 握手失败'));
      }
    },
  };

  try {
    const connection = await ensureWsPool(wsUrl, options.headers);
    connection.activeTurn = activeTurn;

    await sendJson(connection.task, {
      type: 'connect',
      sessionId: options.sessionId,
      activityLegacyId: options.activityLegacyId,
    });

    await connectedReady;

    await sendJson(connection.task, {
      type: 'send',
      messages: options.messages,
      sessionId: options.sessionId,
      userId: options.userId,
      userName: options.userName,
      userPhone: options.userPhone,
      activityLegacyId: options.activityLegacyId,
      image: options.image,
      images: options.images,
    });

    let sawTerminal = false;
    let sawAnyEvent = false;

    while (true) {
      if (options.signal?.aborted) {
        const aborted = new Error('Aborted');
        aborted.name = 'AbortError';
        throw aborted;
      }

      const item = await queue.nextItem();
      if (item.kind === 'error') {
        throw item.error;
      }
      if (item.kind === 'close') {
        break;
      }

      sawAnyEvent = true;
      if (item.event.type === 'done' || item.event.type === 'error') {
        sawTerminal = true;
      }
      yield item.event;
      if (sawTerminal) break;
    }

    if (!sawAnyEvent) {
      const hint = isAiChatWsDevLog()
        ? `（无服务端事件，请检查 WebSocket 路径是否为 /api/ai/chat/ws: ${wsUrl}）`
        : '';
      throw new Error(`AI chat WebSocket closed without events${hint}`);
    }
    if (!sawTerminal) {
      yield { type: 'done' };
    }
  } finally {
    clearTimeout(activeTurn.connectedTimer);
    options.signal?.removeEventListener('abort', onAbort);
    if (wsPool) {
      wsPool.activeTurn = null;
    }
  }
}
