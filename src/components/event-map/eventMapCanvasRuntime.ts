import Taro from "@tarojs/taro";
import { EVENT_MAP_CANVAS_ID } from "./eventMapCanvasId";
import { STORM_LOGO_SRC } from "./eventMapStormLogo";
import {
  invalidateEventMapTerrainCache,
  paintEventMap,
  paintEventMapMinimal,
} from "./eventMapPaint";
import {
  canUseEventMapSceneCache,
  invalidateEventMapSceneCache,
  isEventMapSceneCacheEnabled,
  paintEventMapSceneBlitOnly,
  paintEventMapWithSceneCache,
  rebuildEventMapSceneCache,
} from "./eventMapSceneCache";
import { EVENT_MAP_MARKERS, markerAvatarUrl } from "./eventMapMarkers";
import { clampEventMapViewport, getDefaultEventMapViewport } from "./eventMapWorld";
import type { EventMapViewport } from "./eventMapViewport";
import { MAP_SCALE_MIN } from "./eventMapViewport";

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
let stormLogoImage: CanvasImageSource | null = null;
let stormLogoLoading: Promise<void> | null = null;
let surface: CanvasSurface | null = null;
let avatarsLoading: Promise<void> | null = null;
let retryTimer: ReturnType<typeof setTimeout> | null = null;
let debounceTimer: ReturnType<typeof setTimeout> | null = null;
let gestureTimer: ReturnType<typeof setTimeout> | null = null;
let assetRepaintTimer: ReturnType<typeof setTimeout> | null = null;
let pendingTitle = "";
let active = false;
let mapInteracting = false;
let painting = false;
let paintQueued = false;
let hasPaintedOnce = false;
let richAssetsEnabled = false;
let cachedCanvasNode: WeappCanvas | null = null;
/** Taro React 页面外包一层自定义组件，须在 useLoad 时缓存作用域 */
let eventMapPageScope: object | null = null;
let eventMapComponentScope: object | null = null;

const GESTURE_PAINT_MS = 32;
const ASSET_REPAINT_DEBOUNCE_MS = 100;
const MAX_CANVAS_DPR = 2;
const CANVAS_BIND_MAX_ATTEMPTS = 80;

let viewportDirty = true;
let viewport: EventMapViewport = {
  offsetX: 0,
  offsetY: 0,
  scale: MAP_SCALE_MIN,
};
const EMPTY_AVATARS = new Map<string, CanvasImageSource>();
let logoAnimFrameId: number | null = null;

function requestMapAnimationFrame(callback: () => void): number {
  if (typeof requestAnimationFrame === "function") {
    return requestAnimationFrame(callback);
  }
  return setTimeout(callback, 32) as unknown as number;
}

function cancelMapAnimationFrame(id: number): void {
  if (typeof cancelAnimationFrame === "function") {
    cancelAnimationFrame(id);
  } else {
    clearTimeout(id);
  }
}

function stopLogoRotationLoop(): void {
  if (logoAnimFrameId != null) {
    cancelMapAnimationFrame(logoAnimFrameId);
    logoAnimFrameId = null;
  }
}

function paintLogoRotationFrame(): void {
  if (!active || !surface || mapInteracting || painting) {
    return;
  }
  const stormLogo = richAssetsEnabled ? stormLogoImage : null;
  if (!stormLogo) {
    return;
  }

  resetCtxState(surface);
  if (isEventMapSceneCacheEnabled()) {
    paintSurfaceWithSceneCache(pendingTitle);
    return;
  }

  const { ctx, cssW, cssH } = surface;
  const avatars = avatarsCache;
  try {
    paintEventMap(ctx, cssW, cssH, pendingTitle, avatars, viewport, Date.now(), stormLogo, false);
  } catch {
    // ignore frame errors
  }
}

function syncLogoRotationLoop(): void {
  stopLogoRotationLoop();
  if (!active || mapInteracting || !surface || !richAssetsEnabled || !stormLogoImage) {
    return;
  }

  const tick = () => {
    logoAnimFrameId = null;
    if (!active || mapInteracting || !surface || !stormLogoImage) {
      return;
    }
    paintLogoRotationFrame();
    if (active && !mapInteracting && stormLogoImage) {
      logoAnimFrameId = requestMapAnimationFrame(tick);
    }
  };

  logoAnimFrameId = requestMapAnimationFrame(tick);
}

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

function getCanvasDpr(): number {
  const raw = Taro.getWindowInfo().pixelRatio ?? 2;
  return Math.min(Math.max(1, raw), MAX_CANVAS_DPR);
}

function isCanvas2dNode(node: unknown): node is WeappCanvas {
  return (
    !!node && typeof node === "object" && typeof (node as WeappCanvas).getContext === "function"
  );
}

const CANVAS_SELECTORS = [`#${EVENT_MAP_CANVAS_ID}`, ".s-event-map__canvas", "canvas"] as const;

export function setEventMapPageScope(
  pageScope: object | null | undefined,
  componentScope?: object | null | undefined,
) {
  eventMapPageScope = pageScope ?? null;
  eventMapComponentScope = componentScope ?? null;
}

function runCanvasSelectorQuery(
  scope: object | null,
  selector: string,
): Promise<CanvasNodeResult | undefined> {
  return new Promise((resolve) => {
    const query = scope ? Taro.createSelectorQuery().in(scope) : Taro.createSelectorQuery();
    query
      .select(selector)
      .fields({ node: true, size: true })
      .exec((res) => {
        const raw = res?.[0] as CanvasNodeResult | undefined;
        if (raw?.node && isCanvas2dNode(raw.node)) {
          resolve(raw);
          return;
        }
        resolve(undefined);
      });
  });
}

/**
 * 页面级 Canvas：先 in(page)，再全局；多选择器兜底。
 */
async function queryCanvasNodeGlobal(): Promise<CanvasNodeResult | undefined> {
  if (cachedCanvasNode) {
    const { width, height } = resolveCanvasCssSize();
    return {
      node: cachedCanvasNode,
      width,
      height,
    };
  }

  const scopes: Array<object | null> = [eventMapPageScope, eventMapComponentScope, null];
  for (const scope of scopes) {
    for (const selector of CANVAS_SELECTORS) {
      const raw = await runCanvasSelectorQuery(scope, selector);
      if (raw?.node) {
        cachedCanvasNode = raw.node as WeappCanvas;
        return raw;
      }
    }
  }
  return undefined;
}

function createCanvasImageSource(canvas: HTMLCanvasElement): HTMLImageElement {
  if (typeof (canvas as WeappCanvas).createImage === "function") {
    return (canvas as WeappCanvas).createImage();
  }
  throw new Error("canvas.createImage is required on WeChat");
}

function loadCanvasImage(canvas: HTMLCanvasElement, src: string): Promise<CanvasImageSource> {
  return new Promise((resolve, reject) => {
    const img = createCanvasImageSource(canvas) as HTMLImageElement & {
      onload: (() => void) | null;
      onerror: (() => void) | null;
      src: string;
    };
    img.onload = () => resolve(img);
    img.onerror = () => reject(new Error(`image load failed: ${src}`));
    img.src = src;
  });
}

function syncSurfaceSize(next: CanvasSurface, cssW: number, cssH: number, dpr: number): void {
  const bufferW = Math.floor(cssW * dpr);
  const bufferH = Math.floor(cssH * dpr);

  if (next.canvas.width !== bufferW || next.canvas.height !== bufferH) {
    next.canvas.width = bufferW;
    next.canvas.height = bufferH;
    invalidateEventMapTerrainCache();
    invalidateEventMapSceneCache();
    viewportDirty = true;
    hasPaintedOnce = false;
    richAssetsEnabled = false;
  }

  next.ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
  next.cssW = cssW;
  next.cssH = cssH;
  next.dpr = dpr;
}

function resetCtxState(next: CanvasSurface) {
  const { ctx, dpr } = next;
  ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
  ctx.globalAlpha = 1;
  ctx.globalCompositeOperation = "source-over";
}

function paintSurfaceWithSceneCache(eventTitle: string): boolean {
  if (!surface) {
    return false;
  }

  const { ctx, cssW, cssH } = surface;
  const stormLogo = richAssetsEnabled ? stormLogoImage : null;
  const avatars = richAssetsEnabled ? avatarsCache : EMPTY_AVATARS;
  const hasStormLogo = Boolean(stormLogo);
  const avatarCount = avatars.size;

  const cacheParams = [cssW, cssH, eventTitle, avatarCount, hasStormLogo] as const;

  if (
    !canUseEventMapSceneCache(
      cacheParams[0],
      cacheParams[1],
      cacheParams[2],
      cacheParams[3],
      cacheParams[4],
    )
  ) {
    rebuildEventMapSceneCache(cssW, cssH, eventTitle, avatars, stormLogo);
  }

  if (mapInteracting) {
    return paintEventMapSceneBlitOnly(ctx, cssW, cssH, viewport, eventTitle, avatars, stormLogo);
  }

  return paintEventMapWithSceneCache(
    ctx,
    cssW,
    cssH,
    eventTitle,
    avatars,
    viewport,
    Date.now(),
    stormLogo,
  );
}

function paintSurface(eventTitle: string): boolean {
  if (!active || !surface) {
    return false;
  }

  const { ctx, cssW, cssH } = surface;
  resetCtxState(surface);

  const stormLogo = richAssetsEnabled ? stormLogoImage : null;
  const avatars = richAssetsEnabled ? avatarsCache : EMPTY_AVATARS;
  const gestureLite = mapInteracting;

  try {
    if (isEventMapSceneCacheEnabled()) {
      const cached = paintSurfaceWithSceneCache(eventTitle);
      if (cached) {
        viewportDirty = false;
        hasPaintedOnce = true;
        return true;
      }
    }

    paintEventMap(
      ctx,
      cssW,
      cssH,
      eventTitle,
      avatars,
      viewport,
      Date.now(),
      stormLogo,
      gestureLite,
    );
  } catch (error) {
    console.warn("[eventMapCanvasRuntime] full paint failed, fallback", error);
    try {
      resetCtxState(surface);
      paintEventMapMinimal(ctx, cssW, cssH);
    } catch (fallbackError) {
      console.error("[eventMapCanvasRuntime] fallback paint failed", fallbackError);
      return false;
    }
  }

  viewportDirty = false;
  hasPaintedOnce = true;
  return true;
}

function enqueuePaint() {
  if (!active) {
    return;
  }
  paintQueued = true;
  flushPaintQueue();
}

function flushPaintQueue() {
  if (painting || !paintQueued) {
    return;
  }
  if (!surface) {
    void bindEventMapCanvasAndPaint(pendingTitle, 0);
    return;
  }

  paintQueued = false;
  painting = true;
  try {
    const ok = paintSurface(pendingTitle);
    if (!ok && active) {
      void bindEventMapCanvasAndPaint(pendingTitle, 0);
      return;
    }
    if (ok && !richAssetsEnabled) {
      richAssetsEnabled = true;
      void prefetchStormLogo();
      void prefetchAvatars();
    }
    if (ok) {
      if (!mapInteracting && stormLogoImage) {
        syncLogoRotationLoop();
      } else {
        stopLogoRotationLoop();
      }
    }
  } finally {
    painting = false;
    if (paintQueued) {
      flushPaintQueue();
    }
  }
}

function scheduleAssetRepaint() {
  if (!active) {
    return;
  }
  if (assetRepaintTimer) {
    clearTimeout(assetRepaintTimer);
  }
  assetRepaintTimer = setTimeout(() => {
    assetRepaintTimer = null;
    if (!active || !surface) {
      return;
    }
    invalidateEventMapSceneCache();
    viewportDirty = true;
    enqueuePaint();
  }, ASSET_REPAINT_DEBOUNCE_MS);
}

export function setEventMapInteracting(interacting: boolean) {
  mapInteracting = interacting;
  if (interacting) {
    stopLogoRotationLoop();
    return;
  }
  syncLogoRotationLoop();
}

export function getEventMapViewport(): EventMapViewport {
  return { ...viewport };
}

function applyViewport(next: EventMapViewport) {
  const cssW = surface?.cssW ?? 375;
  const cssH = surface?.cssH ?? 667;
  viewport = clampEventMapViewport(next, cssW, cssH);
  viewportDirty = true;
}

export function setEventMapViewport(next: EventMapViewport) {
  applyViewport(next);
}

export function resetEventMapViewport(cssW?: number, cssH?: number) {
  if (cssW != null && cssH != null && cssW > 0 && cssH > 0) {
    viewport = clampEventMapViewport(getDefaultEventMapViewport(cssW, cssH), cssW, cssH);
  } else {
    viewport = { offsetX: 0, offsetY: 0, scale: MAP_SCALE_MIN };
  }
  viewportDirty = true;
}

function clearRuntimeTimers() {
  if (retryTimer) {
    clearTimeout(retryTimer);
    retryTimer = null;
  }
  if (debounceTimer) {
    clearTimeout(debounceTimer);
    debounceTimer = null;
  }
  if (gestureTimer) {
    clearTimeout(gestureTimer);
    gestureTimer = null;
  }
  if (assetRepaintTimer) {
    clearTimeout(assetRepaintTimer);
    assetRepaintTimer = null;
  }
}

async function setupSurfaceFromNode(item: CanvasNodeResult, eventTitle: string): Promise<boolean> {
  const canvas = item.node;
  if (!canvas || !isCanvas2dNode(canvas)) {
    return false;
  }

  const { width: cssW, height: cssH } = resolveCanvasCssSize(item.width, item.height);
  const dpr = getCanvasDpr();

  const ctx = surface && surface.canvas === canvas ? surface.ctx : canvas.getContext("2d");

  if (!ctx) {
    return false;
  }

  if (!surface || surface.canvas !== canvas) {
    surface = { canvas, ctx, cssW, cssH, dpr };
  } else {
    surface.ctx = ctx;
    surface.cssW = cssW;
    surface.cssH = cssH;
    surface.dpr = dpr;
  }
  syncSurfaceSize(surface, cssW, cssH, dpr);
  if (!hasPaintedOnce) {
    resetEventMapViewport(cssW, cssH);
  }
  pendingTitle = eventTitle;
  enqueuePaint();
  return true;
}

/** 绑定 Canvas 节点并绘制（页面 useReady / useDidShow 调用） */
export async function bindEventMapCanvasAndPaint(eventTitle: string, attempt = 0): Promise<void> {
  if (!active) {
    return;
  }

  const item = await queryCanvasNodeGlobal();
  if (item?.node) {
    if (retryTimer) {
      clearTimeout(retryTimer);
      retryTimer = null;
    }
    await setupSurfaceFromNode(item, eventTitle);
    return;
  }

  if (attempt >= CANVAS_BIND_MAX_ATTEMPTS) {
    console.error("[eventMapCanvasRuntime] canvas node not found");
    return;
  }

  const delay = attempt < 15 ? 40 + attempt * 25 : 180;
  retryTimer = setTimeout(() => {
    retryTimer = null;
    void bindEventMapCanvasAndPaint(eventTitle, attempt + 1);
  }, delay);
}

function prefetchStormLogo() {
  if (!surface || stormLogoImage || stormLogoLoading) {
    return;
  }

  const { canvas } = surface;
  stormLogoLoading = loadCanvasImage(canvas, STORM_LOGO_SRC)
    .then((img) => {
      stormLogoImage = img;
    })
    .catch((error) => {
      console.warn("[eventMapCanvasRuntime] storm logo load failed", error);
    })
    .finally(() => {
      stormLogoLoading = null;
      scheduleAssetRepaint();
      if (active && !mapInteracting) {
        syncLogoRotationLoop();
      }
    });
}

function prefetchAvatars() {
  if (!surface || avatarsLoading) {
    return;
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
        // initials fallback
      }
    }),
  )
    .then(() => undefined)
    .finally(() => {
      avatarsLoading = null;
      scheduleAssetRepaint();
    });
}

export function bootstrapEventMapCanvas(eventTitle: string) {
  active = true;
  mapInteracting = false;
  viewportDirty = true;
  pendingTitle = eventTitle;
  clearRuntimeTimers();

  if (surface && hasPaintedOnce) {
    enqueuePaint();
    return;
  }

  richAssetsEnabled = false;
  hasPaintedOnce = false;
  void bindEventMapCanvasAndPaint(eventTitle, 0);
}

export function onEventMapCanvasReady(eventTitle: string) {
  active = true;
  pendingTitle = eventTitle;
  void bindEventMapCanvasAndPaint(eventTitle, 0);
}

export function requestEventMapPaint(eventTitle: string) {
  pendingTitle = eventTitle;
  if (!active) {
    bootstrapEventMapCanvas(eventTitle);
    return;
  }
  if (surface) {
    viewportDirty = true;
    enqueuePaint();
    return;
  }
  void bindEventMapCanvasAndPaint(eventTitle, 0);
}

export function repaintEventMapNow(eventTitle: string) {
  if (!active) {
    return;
  }
  pendingTitle = eventTitle;
  if (gestureTimer) {
    return;
  }
  gestureTimer = setTimeout(() => {
    gestureTimer = null;
    if (!active) {
      return;
    }
    viewportDirty = true;
    enqueuePaint();
  }, GESTURE_PAINT_MS);
}

export function pauseEventMapCanvas() {
  active = false;
  mapInteracting = false;
  painting = false;
  paintQueued = false;
  stopLogoRotationLoop();
  clearRuntimeTimers();
}

export function resumeEventMapCanvas(eventTitle: string) {
  active = true;
  pendingTitle = eventTitle;
  viewportDirty = true;
  if (surface && cachedCanvasNode) {
    enqueuePaint();
    return;
  }
  void bindEventMapCanvasAndPaint(eventTitle, 0);
}

export function disposeEventMapCanvas() {
  active = false;
  mapInteracting = false;
  stopLogoRotationLoop();
  surface = null;
  cachedCanvasNode = null;
  eventMapPageScope = null;
  eventMapComponentScope = null;
  stormLogoImage = null;
  stormLogoLoading = null;
  avatarsLoading = null;
  avatarsCache.clear();
  painting = false;
  paintQueued = false;
  hasPaintedOnce = false;
  richAssetsEnabled = false;
  resetEventMapViewport();
  invalidateEventMapTerrainCache();
  invalidateEventMapSceneCache();
  viewportDirty = true;
  clearRuntimeTimers();
}
