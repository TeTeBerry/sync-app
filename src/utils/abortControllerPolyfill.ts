/**
 * WeChat mini-program runtimes may lack AbortController / AbortSignal.
 * Minimal polyfill for abort(), signal.aborted, and abort event listeners.
 */
type AbortListener = () => void;

class AbortSignalPolyfill implements AbortSignal {
  aborted = false;
  readonly reason: unknown = undefined;
  onabort: ((this: AbortSignal, ev: Event) => unknown) | null = null;

  private readonly listeners = new Set<AbortListener>();
  private readonly wrappedByOriginal = new Map<AbortListener, AbortListener>();

  addEventListener(
    type: string,
    listener: EventListenerOrEventListenerObject,
    options?: boolean | AddEventListenerOptions,
  ): void {
    if (type !== "abort" || typeof listener !== "function") return;
    const original = listener as AbortListener;
    if (this.aborted) {
      original();
      return;
    }

    const once =
      typeof options === "object" && options != null && options.once === true;
    const stored: AbortListener = once
      ? () => {
          this.removeEventListener("abort", original);
          original();
        }
      : original;

    if (stored !== original) {
      this.wrappedByOriginal.set(original, stored);
    }
    this.listeners.add(stored);
  }

  removeEventListener(
    type: string,
    listener: EventListenerOrEventListenerObject,
  ): void {
    if (type !== "abort" || typeof listener !== "function") return;
    const original = listener as AbortListener;
    const stored = this.wrappedByOriginal.get(original) ?? original;
    this.listeners.delete(stored);
    this.wrappedByOriginal.delete(original);
  }

  dispatchEvent(): boolean {
    return false;
  }

  throwIfAborted(): void {
    if (!this.aborted) return;
    const err = new Error("Aborted");
    err.name = "AbortError";
    throw err;
  }

  /** @internal */
  _dispatchAbort(): void {
    if (this.aborted) return;
    this.aborted = true;
    for (const listener of [...this.listeners]) {
      listener();
    }
    this.listeners.clear();
    this.wrappedByOriginal.clear();
  }
}

class AbortControllerPolyfill implements AbortController {
  readonly signal = new AbortSignalPolyfill();

  abort(): void {
    (this.signal as AbortSignalPolyfill)._dispatchAbort();
  }
}

function installAbortControllerPolyfill(): void {
  const g = globalThis as typeof globalThis & {
    AbortController?: typeof AbortController;
    AbortSignal?: typeof AbortSignal;
  };
  if (typeof g.AbortController === "function") return;

  g.AbortController =
    AbortControllerPolyfill as unknown as typeof AbortController;
  g.AbortSignal = AbortSignalPolyfill as unknown as typeof AbortSignal;
}

installAbortControllerPolyfill();
