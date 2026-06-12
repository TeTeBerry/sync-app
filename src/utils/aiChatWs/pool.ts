import Taro from '@tarojs/taro';
import { isWeappCloudRunTransportEnabled } from '../../constants/cloud';
import { parseStreamEventPayload } from '../aiChatStreamEvents';
import {
  AI_CHAT_WS_CONTAINER_PATH,
  connectContainerSocket,
} from '../cloudRunTransport';
import { decodeWsMessageData } from './decode';
import {
  describeRawWsData,
  devLog,
  devLogWarn,
  isAiChatWsDevLog,
  previewDecodedText,
} from './log';
import { createEventQueue } from './queue';

import { WS_CONNECT_RETRY_MAX, wsReconnectDelayMs } from './reconnect';

const WS_CONNECT_TIMEOUT_MS = 12_000;

export type PooledConnection = {
  wsUrl: string;
  headersKey: string;
  task: Taro.SocketTask;
  /** Last successful `connect` ack for this socket (skip redundant handshakes). */
  handshake?: {
    sessionId?: string;
    activityLegacyId?: number;
  };
  activeTurn: {
    queue: ReturnType<typeof createEventQueue>;
    settleConnected: (action: 'resolve' | 'reject', error?: Error) => void;
    connectedSettled: boolean;
    connectedTimer: ReturnType<typeof setTimeout>;
  } | null;
};

let wsPool: PooledConnection | null = null;
let globalSocketHandlersBound = false;

function routePooledSocketMessage(res: { data: unknown }): void {
  const turn = wsPool?.activeTurn;
  if (!turn) {
    devLog('onMessage dropped (no active turn)');
    return;
  }

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
    if (wsPool) {
      wsPool.handshake = {
        sessionId:
          typeof json.sessionId === 'string'
            ? json.sessionId
            : wsPool.handshake?.sessionId,
        activityLegacyId:
          typeof json.activityLegacyId === 'number'
            ? json.activityLegacyId
            : wsPool.handshake?.activityLegacyId,
      };
    }
    if (!turn.connectedSettled) {
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
}

function routePooledSocketClose(res?: { code?: number; reason?: string }): void {
  devLog('onClose', {
    code: res?.code,
    reason: res?.reason,
  });
  const turn = wsPool?.activeTurn;
  if (turn && !turn.connectedSettled) {
    turn.settleConnected('reject', new Error('WebSocket 连接已关闭'));
  }
  turn?.queue.push({ kind: 'close' });
  wsPool = null;
}

function routePooledSocketError(err: { errMsg?: string }): void {
  devLog('onError', { errMsg: err.errMsg });
  const turn = wsPool?.activeTurn;
  if (turn && !turn.connectedSettled) {
    turn.settleConnected('reject', new Error(err.errMsg || 'WebSocket 连接异常'));
  }
  turn?.queue.push({
    kind: 'error',
    error: new Error(err.errMsg || 'WebSocket 连接异常'),
  });
  wsPool = null;
}

function headersKey(headers?: Record<string, string>): string {
  if (!headers) return '';
  return JSON.stringify(
    Object.keys(headers)
      .sort()
      .map((k) => [k, headers[k]]),
  );
}

function poolEndpointKey(wsUrl: string, headers?: Record<string, string>): string {
  if (isWeappCloudRunTransportEnabled()) {
    return `container:${AI_CHAT_WS_CONTAINER_PATH}:${headersKey(headers)}`;
  }
  return `url:${wsUrl}:${headersKey(headers)}`;
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
  globalSocketHandlersBound = false;
}

export function isWsHandshakeReady(
  connection: PooledConnection,
  sessionId?: string,
  activityLegacyId?: number,
): boolean {
  const handshake = connection.handshake;
  if (!handshake) return false;
  const sessionOk = !sessionId?.trim() || handshake.sessionId === sessionId.trim();
  const activityOk =
    activityLegacyId == null ||
    Number.isNaN(activityLegacyId) ||
    handshake.activityLegacyId === activityLegacyId;
  return sessionOk && activityOk;
}

function attachPoolListeners(connection: PooledConnection): void {
  bindSocketListeners(connection.task, {
    onMessage: routePooledSocketMessage,
    onClose: routePooledSocketClose,
    onError: routePooledSocketError,
  });
}

export async function ensureWsPool(
  wsUrl: string,
  headers?: Record<string, string>,
): Promise<PooledConnection> {
  const key = poolEndpointKey(wsUrl, headers);
  if (wsPool && wsPool.wsUrl === key && wsPool.headersKey === headersKey(headers)) {
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
  for (let attempt = 0; attempt <= WS_CONNECT_RETRY_MAX; attempt += 1) {
    try {
      const useContainer = isWeappCloudRunTransportEnabled();
      devLogWarn('connecting', {
        transport: useContainer ? 'connectContainer' : 'connectSocket',
        url: useContainer ? AI_CHAT_WS_CONTAINER_PATH : wsUrl,
        attempt,
      });
      const task = useContainer
        ? await connectContainerSocket(
            AI_CHAT_WS_CONTAINER_PATH,
            headers,
            WS_CONNECT_TIMEOUT_MS,
          )
        : await connectSocket(wsUrl, headers);
      const connection: PooledConnection = {
        wsUrl: key,
        headersKey: headersKey(headers),
        task,
        activeTurn: null,
      };
      attachPoolListeners(connection);
      wsPool = connection;
      devLogWarn('onOpen', { endpoint: key });
      return connection;
    } catch (error) {
      lastError = error instanceof Error ? error : new Error(String(error));
      if (attempt < WS_CONNECT_RETRY_MAX) {
        await new Promise((resolve) =>
          setTimeout(resolve, wsReconnectDelayMs(attempt)),
        );
      }
    }
  }

  throw lastError ?? new Error('WebSocket 连接失败');
}

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
  if (!globalSocketHandlersBound) {
    globalSocketHandlersBound = true;
    Taro.onSocketMessage(handlers.onMessage);
    Taro.onSocketClose(handlers.onClose);
    Taro.onSocketError(handlers.onError);
  }
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

      Taro.onSocketOpen(onOpen);
      Taro.onSocketError(onConnectError);
    })();
  });
}

const WS_SEND_TIMEOUT_MS = 15_000;

export function sendJson(task: Taro.SocketTask, payload: unknown): Promise<void> {
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
    let settled = false;
    const timer = setTimeout(() => {
      if (settled) return;
      settled = true;
      reject(new Error('WebSocket 发送超时，请检查网络后重试'));
    }, WS_SEND_TIMEOUT_MS);

    const finish = (action: 'resolve' | 'reject', error?: Error) => {
      if (settled) return;
      settled = true;
      clearTimeout(timer);
      if (action === 'resolve') resolve();
      else reject(error ?? new Error('WebSocket 发送失败'));
    };

    task.send({
      data: body,
      success: () => finish('resolve'),
      fail: (err) => finish('reject', new Error(err.errMsg || 'WebSocket 发送失败')),
    });
  });
}

export function getWsPool(): PooledConnection | null {
  return wsPool;
}

export function clearActiveTurn(): void {
  if (wsPool) {
    wsPool.activeTurn = null;
  }
}
