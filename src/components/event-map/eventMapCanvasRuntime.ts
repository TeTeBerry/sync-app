import Taro from "@tarojs/taro";
import { EVENT_MAP_CANVAS_ID } from "./eventMapCanvasId";
import { paintEventMap } from "./eventMapPaint";
import { EVENT_MAP_MARKERS, markerAvatarUrl } from "./eventMapMarkers";
import {
  DEFAULT_EVENT_MAP_VIEWPORT,
  type EventMapViewport,
} from "./eventMapViewport";

type CanvasImageSource = Parameters<CanvasRenderingContext2D["drawImage"]>[0];

type WeappCanvas = HTMLCanvasElement & {
  createImage: () => HTMLImageElement;
};

type CanvasNodeResult = {
  node?: HTMLCanvasElement;
  width?: number;
  height?: number;
};

type CanvasSurface = {
  canvas: HTMLCanvasElement;
  ctx: CanvasRenderingContext2D;
  cssW: number;
  cssH: number;
  dpr: number;
};

const avatarsCache = new Map<string, CanvasImageSource>();
let surface: CanvasSurface | null = null;
let avatarsLoading: Promise<void> | null = null;
let retryTimer: ReturnType<typeof setTimeout> | null = null;
let pendingTitle = "";
let debounceTimer: ReturnType<typeof setTimeout> | null = null;
let active = true;
let viewport: EventMapViewport = { ...DEFAULT_EVENT_MAP_VIEWPORT };

function resolveCanvasCssSize(
  measuredWidth?: number,
  measuredHeight?: number,
): { width: number; height: number } {
  const windowInfo = Taro.getWindowInfo();
  const fallbackW = windowInfo.windowWidth ?? 375;
  const fallbackH = windowInfo.windowHeight ?? 667;
  return {
    width: Math.max(1, measuredWidth || fallbackW),
    height: Math.max(1, measuredHeight || fallbackH),
  };
}

function queryCanvasNode(): Promise<CanvasNodeResult | undefined> {
  return new Promise((resolve) => {
    Taro.createSelectorQuery()
      .select(`#${EVENT_MAP_CANVAS_ID}`)
      .fields({ node: true, size: true })
      .exec((res) => {
        resolve(res?.[0] as CanvasNodeResult | undefined);
      });
  });
}

function createCanvasImageSource(canvas: HTMLCanvasElement): HTMLImageElement {
  if (typeof (canvas as WeappCanvas).createImage === "function") {
    return (canvas as WeappCanvas).createImage();
  }
  return new Image();
}

function loadCanvasImage(
  canvas: HTMLCanvasElement,
  src: string,
): Promise<CanvasImageSource> {
  return new Promise((resolve, reject) => {
    const img = createCanvasImageSource(canvas) as HTMLImageElement & {
      onload: (() => void) | null;
      onerror: (() => void) | null;
      src: string;
    };
    img.onload = () => resolve(img);
    img.onerror = () => reject(new Error(`avatar load failed: ${src}`));
    img.src = src;
  });
}

function syncSurfaceSize(
  next: CanvasSurface,
  cssW: number,
  cssH: number,
  dpr: number,
): boolean {
  const bufferW = Math.floor(cssW * dpr);
  const bufferH = Math.floor(cssH * dpr);
  const sizeChanged =
    next.canvas.width !== bufferW || next.canvas.height !== bufferH;

  if (sizeChanged) {
    next.canvas.width = bufferW;
    next.canvas.height = bufferH;
  }

  next.ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
  next.cssW = cssW;
  next.cssH = cssH;
  next.dpr = dpr;
  return sizeChanged;
}

function paintSurface(eventTitle: string) {
  if (!active || !surface) {
    return;
  }
  try {
    paintEventMap(
      surface.ctx,
      surface.cssW,
      surface.cssH,
      eventTitle,
      avatarsCache,
      viewport,
    );
  } catch (error) {
    console.error("[eventMapCanvasRuntime] paint failed", error);
  }
}

export function getEventMapViewport(): EventMapViewport {
  return { ...viewport };
}

export function setEventMapViewport(next: EventMapViewport) {
  viewport = {
    offsetX: next.offsetX,
    offsetY: next.offsetY,
    scale: next.scale,
  };
}

export function resetEventMapViewport() {
  viewport = { ...DEFAULT_EVENT_MAP_VIEWPORT };
}

/** Immediate repaint (gesture frames); skips debounce. */
export function repaintEventMapNow(eventTitle: string) {
  if (!active) {
    return;
  }
  pendingTitle = eventTitle;
  if (surface) {
    paintSurface(eventTitle);
    return;
  }
  void runPaintPipeline(eventTitle, 0);
}

function prefetchAvatars() {
  if (!surface || avatarsLoading) {
    return avatarsLoading ?? Promise.resolve();
  }

  const { canvas } = surface;
  avatarsLoading = Promise.all(
    EVENT_MAP_MARKERS.map(async (marker) => {
      const src = markerAvatarUrl(marker.avatarSeed);
      if (avatarsCache.has(src)) {
        return;
      }
      try {
        const img = await loadCanvasImage(canvas, src);
        avatarsCache.set(src, img);
      } catch {
        // initials fallback in paint
      }
    }),
  ).then(() => {
    avatarsLoading = null;
  });

  return avatarsLoading;
}

async function ensureSurface(
  item: CanvasNodeResult,
): Promise<CanvasSurface | null> {
  if (!item.node) {
    return null;
  }

  const ctx = item.node.getContext("2d");
  if (!ctx) {
    return null;
  }

  const { width: cssW, height: cssH } = resolveCanvasCssSize(
    item.width,
    item.height,
  );
  const dpr = Taro.getWindowInfo().pixelRatio ?? 2;

  if (!surface || surface.canvas !== item.node) {
    surface = {
      canvas: item.node,
      ctx,
      cssW,
      cssH,
      dpr,
    };
    syncSurfaceSize(surface, cssW, cssH, dpr);
    return surface;
  }

  syncSurfaceSize(surface, cssW, cssH, dpr);
  return surface;
}

function scheduleRetry(eventTitle: string, attempt: number) {
  if (!active || attempt >= 30) {
    return;
  }
  const delay = attempt < 6 ? 50 + attempt * 20 : 120;
  retryTimer = setTimeout(() => {
    retryTimer = null;
    void runPaintPipeline(eventTitle, attempt + 1);
  }, delay);
}

async function runPaintPipeline(eventTitle: string, attempt = 0) {
  if (!active) {
    return;
  }

  const item = await queryCanvasNode();
  const nextSurface = item ? await ensureSurface(item) : null;

  if (!nextSurface) {
    scheduleRetry(eventTitle, attempt);
    return;
  }

  paintSurface(eventTitle);

  void prefetchAvatars()?.then(() => {
    if (active) {
      paintSurface(eventTitle);
    }
  });
}

/** Queue a map paint (debounces burst calls within one frame). */
export function requestEventMapPaint(eventTitle: string) {
  if (!active) {
    return;
  }

  pendingTitle = eventTitle;

  if (debounceTimer) {
    return;
  }

  debounceTimer = setTimeout(() => {
    debounceTimer = null;
    const title = pendingTitle;
    Taro.nextTick(() => {
      void runPaintPipeline(title, 0);
    });
  }, 16);
}

/** Call when the map page is shown again (e.g. navigate back). */
export function resumeEventMapCanvas(eventTitle: string) {
  active = true;
  resetEventMapViewport();
  requestEventMapPaint(eventTitle);
}

/** Call when leaving the map page. */
export function disposeEventMapCanvas() {
  active = false;
  surface = null;
  avatarsLoading = null;
  resetEventMapViewport();
  if (retryTimer) {
    clearTimeout(retryTimer);
    retryTimer = null;
  }
  if (debounceTimer) {
    clearTimeout(debounceTimer);
    debounceTimer = null;
  }
}
