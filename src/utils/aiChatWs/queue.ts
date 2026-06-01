import type { WsQueueItem } from './types';

export function createEventQueue() {
  const pending: WsQueueItem[] = [];
  let resolveNext: ((item: WsQueueItem) => void) | null = null;

  const push = (item: WsQueueItem) => {
    if (resolveNext) {
      const resolve = resolveNext;
      resolveNext = null;
      resolve(item);
      return;
    }
    pending.push(item);
  };

  const nextItem = (): Promise<WsQueueItem> => {
    const existing = pending.shift();
    if (existing) return Promise.resolve(existing);
    return new Promise((resolve) => {
      resolveNext = resolve;
    });
  };

  return { push, nextItem };
}
