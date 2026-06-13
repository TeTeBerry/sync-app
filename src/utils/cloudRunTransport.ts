import Taro from '@tarojs/taro';
import {
  CLOUDBASE_ENV_ID,
  CLOUD_RUN_MAX_TIMEOUT_MS,
  CLOUD_RUN_SERVICE,
  isWeappCloudRunTransportEnabled,
} from '../constants/cloud';
import { taroRequestData } from './apiRequestBody';

/** AI chat WebSocket path on the Nest container (connectContainer `path`). */
export const AI_CHAT_WS_CONTAINER_PATH = '/api/ai/chat/ws';

type ConnectContainerCloud = {
  connectContainer: (params: {
    config: { env: string };
    service: string;
    path: string;
    header?: Record<string, string>;
    timeout?: number;
  }) => Promise<{ socketTask: Taro.SocketTask }>;
};

export function buildContainerApiPath(
  path: string,
  params?: Record<string, string | undefined>,
): string {
  const normalizedPath = path.startsWith('/') ? path : `/${path}`;
  let containerPath = `/api${normalizedPath}`;

  if (params) {
    const pairs: string[] = [];
    for (const [key, value] of Object.entries(params)) {
      if (value !== undefined && value !== '') {
        pairs.push(`${encodeURIComponent(key)}=${encodeURIComponent(value)}`);
      }
    }
    if (pairs.length > 0) {
      containerPath += `${containerPath.includes('?') ? '&' : '?'}${pairs.join('&')}`;
    }
  }

  return containerPath;
}

/** callContainer 请求包上限约 100KB（含 body）。 */
export const CALL_CONTAINER_MAX_BODY_BYTES = 95_000;

function readCloudContainerErrorMessage(error: unknown): string {
  if (error instanceof Error && error.message.trim()) {
    return error.message.trim();
  }
  if (typeof error === 'object' && error !== null) {
    const errMsg = (error as { errMsg?: string }).errMsg;
    if (typeof errMsg === 'string' && errMsg.trim()) {
      return errMsg.trim();
    }
    const errCode = (error as { errCode?: number }).errCode;
    if (typeof errCode === 'number') {
      return String(errCode);
    }
  }
  return String(error ?? '请求失败');
}

function assertCallContainerPayloadSize(data: unknown): void {
  if (data == null) return;
  const bytes = JSON.stringify(data).length;
  if (bytes > CALL_CONTAINER_MAX_BODY_BYTES) {
    throw new Error(
      `请求数据过大（${Math.round(bytes / 1024)}KB），请先将截图上传到云存储`,
    );
  }
}

export interface ContainerHttpResponse {
  ok: boolean;
  status: number;
  json(): Promise<unknown>;
}

function assertCloudRunReady(): void {
  if (!isWeappCloudRunTransportEnabled()) {
    throw new Error(
      '云托管内网通道未配置（TARO_APP_CLOUDBASE_ENV_ID / TARO_APP_CLOUD_RUN_SERVICE）',
    );
  }
  if (!Taro.cloud?.callContainer) {
    throw new Error('当前基础库不支持 callContainer，请将基础库最低版本设为 2.23.0+');
  }
}

export async function callContainerRequest(
  containerPath: string,
  init: RequestInit,
  timeoutMs: number,
): Promise<ContainerHttpResponse> {
  assertCloudRunReady();

  const headers = { ...(init.headers as Record<string, string> | undefined) };
  const method = (
    init.method || 'GET'
  ).toUpperCase() as Taro.cloud.CallContainerParam['method'];
  const effectiveTimeout = Math.min(timeoutMs, CLOUD_RUN_MAX_TIMEOUT_MS);
  const requestData = taroRequestData(init);
  assertCallContainerPayloadSize(requestData);

  try {
    const result = await Taro.cloud.callContainer({
      config: { env: CLOUDBASE_ENV_ID },
      path: containerPath,
      method,
      header: {
        ...headers,
        'X-WX-SERVICE': CLOUD_RUN_SERVICE,
      },
      data: requestData,
      timeout: effectiveTimeout,
    });

    return {
      ok: result.statusCode >= 200 && result.statusCode < 300,
      status: result.statusCode,
      json: async () => result.data,
    };
  } catch (error) {
    const message = readCloudContainerErrorMessage(error);
    if (message.includes('102002')) {
      throw new Error('云托管请求超时，请稍后重试');
    }
    if (message.includes('-606001') || message.includes('606001')) {
      throw new Error('请求数据过大，请先将截图上传到云存储后重试');
    }
    throw new Error(message || '请求失败');
  }
}

export async function connectContainerSocket(
  path: string,
  headers?: Record<string, string>,
  timeoutMs = 12_000,
): Promise<Taro.SocketTask> {
  assertCloudRunReady();

  const connectContainer = (Taro.cloud as unknown as ConnectContainerCloud)
    .connectContainer;
  if (!connectContainer) {
    throw new Error(
      '当前基础库不支持 connectContainer，请将基础库最低版本设为 2.23.0+',
    );
  }

  const { socketTask } = await connectContainer({
    config: { env: CLOUDBASE_ENV_ID },
    service: CLOUD_RUN_SERVICE,
    path,
    header: headers,
    timeout: timeoutMs,
  });

  return new Promise((resolve, reject) => {
    let settled = false;

    const fail = (message: string) => {
      if (settled) return;
      settled = true;
      clearTimeout(timer);
      reject(new Error(message));
    };

    const timer = setTimeout(() => {
      fail('WebSocket 连接超时');
      try {
        socketTask.close({ code: 1000, reason: 'connect timeout' });
      } catch {
        // ignore
      }
    }, timeoutMs);

    const onOpen = () => {
      if (settled) return;
      settled = true;
      clearTimeout(timer);
      resolve(socketTask);
    };

    if (typeof socketTask.onOpen === 'function') {
      socketTask.onOpen(onOpen);
      socketTask.onError((err) => fail(err.errMsg || 'WebSocket 连接失败'));
      return;
    }

    Taro.onSocketOpen(onOpen);
    Taro.onSocketError((err) => fail(err.errMsg || 'WebSocket 连接失败'));
  });
}
