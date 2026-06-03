import type { EventMapViewport } from './eventMapViewport';
import { applyViewportTransform } from './eventMapViewport';
import { getMapWorldDimensions } from './eventMapWorld';
import {
  createOffscreenCanvas,
  isOffscreenCanvasSupported,
} from './mapOffscreenCanvas';
import {
  EVENT_MAP_BG,
  paintEventMapDecorLayer,
  paintEventMapMarkersAfterVenueLayer,
  paintEventMapScene,
  paintEventMapStormLogoLayer,
  paintEventMapStormLogoLayerStatic,
} from './eventMapPaint';

/** 离屏 Canvas 可用时启用；blit 失败会自动降级 */
let sceneCacheRuntimeEnabled = isOffscreenCanvasSupported();

/** 静态层在默认视口下烘焙，平移/缩放由 blit 时 transform 完成 */
const SCENE_CACHE_VIEWPORT: EventMapViewport = {
  offsetX: 0,
  offsetY: 0,
  scale: 1,
};

export function isEventMapSceneCacheEnabled(): boolean {
  return sceneCacheRuntimeEnabled;
}

export function disableEventMapSceneCacheRuntime(): void {
  sceneCacheRuntimeEnabled = false;
  sceneCache = null;
}

type CanvasImageSource = Parameters<CanvasRenderingContext2D['drawImage']>[0];

export type EventMapSceneCache = {
  key: string;
  canvas: HTMLCanvasElement;
  ctx: CanvasRenderingContext2D;
  /** CSS viewport size (screen px) */
  cssW: number;
  cssH: number;
  /** Logical map size baked into the offscreen buffer */
  worldW: number;
  worldH: number;
};

let sceneCache: EventMapSceneCache | null = null;

function sceneCacheKey(
  width: number,
  height: number,
  eventTitle: string,
  avatarCount: number,
  hasStormLogo: boolean,
): string {
  return [width, height, eventTitle, avatarCount, hasStormLogo ? 1 : 0].join('|');
}

export function invalidateEventMapSceneCache(): void {
  sceneCache = null;
}

export function getEventMapSceneCache(): EventMapSceneCache | null {
  return sceneCache;
}

export function rebuildEventMapSceneCache(
  width: number,
  height: number,
  eventTitle: string,
  avatars: Map<string, CanvasImageSource>,
  stormLogo?: CanvasImageSource | null,
): boolean {
  if (!sceneCacheRuntimeEnabled) {
    sceneCache = null;
    return false;
  }

  const key = sceneCacheKey(width, height, eventTitle, avatars.size, !!stormLogo);

  if (sceneCache && sceneCache.key === key) {
    return true;
  }

  const { worldW, worldH } = getMapWorldDimensions(width, height);

  try {
    let canvas = sceneCache?.canvas ?? null;
    if (
      !canvas ||
      sceneCache!.cssW !== width ||
      sceneCache!.cssH !== height ||
      sceneCache!.worldW !== worldW ||
      sceneCache!.worldH !== worldH
    ) {
      canvas = createOffscreenCanvas(worldW, worldH);
      if (!canvas) {
        sceneCache = null;
        return false;
      }
      canvas.width = worldW;
      canvas.height = worldH;
    }

    const ctx = canvas.getContext('2d');
    if (!ctx) {
      sceneCache = null;
      return false;
    }

    paintEventMapScene(
      ctx,
      width,
      height,
      eventTitle,
      avatars,
      SCENE_CACHE_VIEWPORT,
      stormLogo,
    );
    sceneCache = {
      key,
      canvas,
      ctx,
      cssW: width,
      cssH: height,
      worldW,
      worldH,
    };
    return true;
  } catch (error) {
    console.warn('[eventMapSceneCache] rebuild failed', error);
    sceneCache = null;
    return false;
  }
}

export function canUseEventMapSceneCache(
  width: number,
  height: number,
  eventTitle: string,
  avatarCount: number,
  hasStormLogo: boolean,
): boolean {
  if (!sceneCache) {
    return false;
  }
  return (
    sceneCache.cssW === width &&
    sceneCache.cssH === height &&
    sceneCache.key ===
      sceneCacheKey(width, height, eventTitle, avatarCount, hasStormLogo)
  );
}

function blitSceneCache(
  ctx: CanvasRenderingContext2D,
  width: number,
  height: number,
  viewport: EventMapViewport,
): boolean {
  if (!sceneCache) {
    return false;
  }
  const { worldW, worldH } = getMapWorldDimensions(width, height);
  ctx.fillStyle = EVENT_MAP_BG;
  ctx.fillRect(0, 0, width, height);
  ctx.save();
  applyViewportTransform(ctx, viewport);
  ctx.drawImage(sceneCache.canvas, 0, 0, worldW, worldH);
  ctx.restore();
  return true;
}

function paintVenueOverlayLayers(
  ctx: CanvasRenderingContext2D,
  width: number,
  height: number,
  eventTitle: string,
  avatars: Map<string, CanvasImageSource>,
  viewport: EventMapViewport,
  time: number,
  stormLogo: CanvasImageSource | null | undefined,
  options: { logo?: boolean },
): void {
  if (options.logo) {
    paintEventMapStormLogoLayer(ctx, width, height, viewport, time, stormLogo);
  }
  paintEventMapDecorLayer(ctx, width, height, eventTitle, viewport, stormLogo);
  paintEventMapMarkersAfterVenueLayer(ctx, width, height, avatars, viewport);
}

/** 拖拽中：blit 静态层 + 世界坐标静态 LOGO + 装饰 + 后方标记 */
export function paintEventMapSceneBlitOnly(
  ctx: CanvasRenderingContext2D,
  width: number,
  height: number,
  viewport: EventMapViewport,
  eventTitle: string,
  avatars: Map<string, CanvasImageSource>,
  stormLogo: CanvasImageSource | null | undefined,
): boolean {
  if (!sceneCacheRuntimeEnabled || !sceneCache) {
    return false;
  }
  try {
    blitSceneCache(ctx, width, height, viewport);
    paintEventMapStormLogoLayerStatic(ctx, width, height, viewport, stormLogo);
    paintVenueOverlayLayers(
      ctx,
      width,
      height,
      eventTitle,
      avatars,
      viewport,
      0,
      stormLogo,
      {
        logo: false,
      },
    );
    return true;
  } catch (error) {
    console.warn('[eventMapSceneCache] gesture blit failed', error);
    disableEventMapSceneCacheRuntime();
    return false;
  }
}

/** 静态 blit + 慢速旋转 LOGO 层 */
export function paintEventMapWithSceneCache(
  ctx: CanvasRenderingContext2D,
  width: number,
  height: number,
  eventTitle: string,
  avatars: Map<string, CanvasImageSource>,
  viewport: EventMapViewport,
  time: number,
  stormLogo: CanvasImageSource | null | undefined,
): boolean {
  if (
    !sceneCacheRuntimeEnabled ||
    !sceneCache ||
    sceneCache.cssW !== width ||
    sceneCache.cssH !== height
  ) {
    return false;
  }

  const expectedKey = sceneCacheKey(
    width,
    height,
    eventTitle,
    avatars.size,
    !!stormLogo,
  );
  if (sceneCache.key !== expectedKey) {
    return false;
  }

  try {
    blitSceneCache(ctx, width, height, viewport);
    paintVenueOverlayLayers(
      ctx,
      width,
      height,
      eventTitle,
      avatars,
      viewport,
      time,
      stormLogo,
      {
        logo: true,
      },
    );
    return true;
  } catch (error) {
    console.warn('[eventMapSceneCache] blit failed', error);
    disableEventMapSceneCacheRuntime();
    return false;
  }
}
