import { resolveAiChatWsUrl } from '../../constants/api';

const LOG_PREFIX = '[SYNC AI WS]';

const WS_LOG_WARN_EVENTS = new Set([
  'stream start',
  'connecting',
  'onOpen',
  'onClose',
  'onError',
  'send',
  'server error frame',
]);

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

export function describeRawWsData(raw: unknown): string {
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

export function previewDecodedText(text: string, max = 160): string {
  const oneLine = text.replace(/\s+/g, ' ').trim();
  return oneLine.length <= max ? oneLine : `${oneLine.slice(0, max)}…`;
}

export function wsLog(message: string, detail?: unknown, forceWarn = false): void {
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

export function devLog(message: string, detail?: unknown): void {
  wsLog(message, detail);
}

export function devLogWarn(message: string, detail?: unknown): void {
  wsLog(message, detail, true);
}
