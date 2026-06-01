export interface TypewriterRevealOptions {
  onUpdate: (visible: string) => void;
  /** 每个字符间隔（毫秒） */
  charDelayMs?: number;
}

export interface TypewriterReveal {
  append: (chunk: string) => void;
  /** Set final target without skipping animation (e.g. message_complete after delta). */
  ensureTarget: (text: string) => void;
  /** Replace target and show full text immediately (errors / abort). */
  setFullText: (text: string) => void;
  flush: () => void;
  stop: () => void;
  waitUntilComplete: () => Promise<void>;
  getTarget: () => string;
}

export function createTypewriterReveal(
  options: TypewriterRevealOptions,
): TypewriterReveal {
  const charDelayMs = options.charDelayMs ?? 22;
  let target = '';
  let visible = '';
  let timer: ReturnType<typeof setTimeout> | null = null;
  let resolveWait: (() => void) | null = null;

  const notifyWaiters = () => {
    if (visible.length >= target.length && !timer && resolveWait) {
      const resolve = resolveWait;
      resolveWait = null;
      resolve();
    }
  };

  const tick = () => {
    if (visible.length >= target.length) {
      timer = null;
      notifyWaiters();
      return;
    }

    visible = target.slice(0, visible.length + 1);
    options.onUpdate(visible);
    timer = setTimeout(tick, charDelayMs);
  };

  const ensureRunning = () => {
    if (timer == null && visible.length < target.length) {
      tick();
    }
  };

  const flushNow = () => {
    if (timer) {
      clearTimeout(timer);
      timer = null;
    }
    visible = target;
    options.onUpdate(visible);
    notifyWaiters();
  };

  return {
    append(chunk: string) {
      if (!chunk) return;
      target += chunk;
      ensureRunning();
    },
    ensureTarget(text: string) {
      if (!text) return;
      if (text.length <= target.length) return;
      target = text;
      ensureRunning();
    },
    setFullText(text: string) {
      target = text;
      flushNow();
    },
    flush: flushNow,
    stop() {
      if (timer) {
        clearTimeout(timer);
        timer = null;
      }
    },
    waitUntilComplete() {
      if (visible.length >= target.length && !timer) {
        return Promise.resolve();
      }
      return new Promise<void>((resolve) => {
        resolveWait = resolve;
        ensureRunning();
      });
    },
    getTarget: () => target,
  };
}
