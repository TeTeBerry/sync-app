export interface TypewriterRevealOptions {
  onUpdate: (visible: string) => void;
  /** 每个字符间隔（毫秒） */
  charDelayMs?: number;
}

export interface TypewriterReveal {
  append: (chunk: string) => void;
  flush: () => void;
  stop: () => void;
  waitUntilComplete: () => Promise<void>;
  getTarget: () => string;
}

export function createTypewriterReveal(
  options: TypewriterRevealOptions,
): TypewriterReveal {
  const charDelayMs = options.charDelayMs ?? 22;
  let target = "";
  let visible = "";
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

  return {
    append(chunk: string) {
      if (!chunk) return;
      target += chunk;
      ensureRunning();
    },
    flush() {
      if (timer) {
        clearTimeout(timer);
        timer = null;
      }
      visible = target;
      options.onUpdate(visible);
      notifyWaiters();
    },
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
