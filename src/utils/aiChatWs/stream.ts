import { resolveAiChatWsUrl } from '../../constants/api';
import type { AiChatStreamEvent } from '../../types/aiChat';
import { devLogWarn, isAiChatWsDevLog } from './log';
import {
  clearActiveTurn,
  closeAiChatWsConnection,
  ensureWsPool,
  getWsPool,
  sendJson,
  type PooledConnection,
} from './pool';
import { createEventQueue } from './queue';
import type { StreamAiChatWsOptions } from './types';

const WS_CONNECTED_ACK_TIMEOUT_MS = 5_000;
const WS_TURN_TIMEOUT_MS = 90_000;

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
    // Fresh socket each turn — avoids server `busy` stuck on reused connections.
    closeAiChatWsConnection('new turn');

    const connection = await ensureWsPool(wsUrl, options.headers);
    connection.activeTurn = activeTurn;

    await sendJson(connection.task, {
      type: 'connect',
      sessionId: options.sessionId,
      activityLegacyId: options.activityLegacyId,
    });
    await connectedReady;

    devLogWarn('send user turn', {
      messageCount: options.messages.length,
      activityLegacyId: options.activityLegacyId,
    });

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

    const turnTimedOut = new Promise<never>((_, reject) => {
      setTimeout(
        () => reject(new Error('AI 回复超时，请检查网络或稍后重试')),
        WS_TURN_TIMEOUT_MS,
      );
    });

    let sawTerminal = false;
    let sawAnyEvent = false;

    while (true) {
      if (options.signal?.aborted) {
        const aborted = new Error('Aborted');
        aborted.name = 'AbortError';
        throw aborted;
      }

      const item = await Promise.race([queue.nextItem(), turnTimedOut]);
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
  } catch (error) {
    const aborted = error instanceof Error && error.name === 'AbortError';
    if (!aborted) {
      closeAiChatWsConnection('turn failed');
    }
    throw error;
  } finally {
    clearTimeout(activeTurn.connectedTimer);
    options.signal?.removeEventListener('abort', onAbort);
    if (getWsPool()) {
      clearActiveTurn();
    }
  }
}
