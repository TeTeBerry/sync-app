import Taro from '@tarojs/taro';
import { parseStreamEventPayload } from '../aiChatStreamEvents';
import { decodeWsMessageData } from './decode';
import {
  describeRawWsData,
  devLog,
  devLogWarn,
  isAiChatWsDevLog,
  previewDecodedText,
} from './log';
import { createEventQueue } from './queue';

const WS_CONNECT_TIMEOUT_MS = 12_000;
const WS_RECONNECT_MAX = 2;
const WS_RECONNECT_BASE_MS = 400;

export type PooledConnection = {
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

export async function ensureWsPool(
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

      Taro.onSocketOpen(onOpen);
      Taro.onSocketError(onConnectError);
    })();
  });
}

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
    task.send({
      data: body,
      success: () => resolve(),
      fail: (err) => reject(new Error(err.errMsg || 'WebSocket 发送失败')),
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
