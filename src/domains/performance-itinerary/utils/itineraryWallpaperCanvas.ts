import Taro from '@tarojs/taro';
import { createOffscreenCanvas } from '@/utils/offscreenCanvas';
import { drawItineraryWallpaper } from './itineraryWallpaperDraw';
import type { ItineraryWallpaperDrawParams } from './itineraryWallpaperDraw';
import type { ItineraryWallpaperSection } from './itineraryWallpaperParse';

export const ITINERARY_WALLPAPER_CANVAS_ID = 'sync-itinerary-wallpaper-canvas';

type WallpaperCanvas = HTMLCanvasElement & {
  getContext(contextId: '2d'): CanvasRenderingContext2D | null;
};

export type WallpaperCanvasSize = {
  width: number;
  height: number;
  scaleFactor: number;
};

/**
 * Lock-screen wallpaper size: device viewport pixels only (no scroll / no tall export).
 */
export function getWallpaperCanvasSize(
  _sections: ItineraryWallpaperSection[],
  _eventMeta?: string,
): WallpaperCanvasSize {
  try {
    const sys = Taro.getSystemInfoSync?.() ?? {};
    const win = Taro.getWindowInfo();
    const windowWidth = win.windowWidth ?? sys.windowWidth ?? 390;
    const screenHeight =
      win.screenHeight ?? win.windowHeight ?? sys.windowHeight ?? 844;
    // Cap at 2× — lock-screen export does not need 3×; halves pixel count on Pro devices.
    const pixelRatio = Math.min(2, win.pixelRatio ?? sys.pixelRatio ?? 2);

    const scaleFactor = windowWidth / 390;
    const width = Math.min(1080, Math.max(720, Math.round(windowWidth * pixelRatio)));
    const height = Math.round(screenHeight * pixelRatio);

    return { width, height, scaleFactor };
  } catch {
    const width = 1080;
    return {
      width,
      height: 2340,
      scaleFactor: width / 390,
    };
  }
}

function paintWallpaper(
  canvas: WallpaperCanvas,
  params: ItineraryWallpaperDrawParams,
): CanvasRenderingContext2D {
  const { width, height } = params;
  canvas.width = width;
  canvas.height = height;
  const ctx = canvas.getContext('2d');
  if (!ctx) {
    throw new Error('canvas 2d context unavailable');
  }
  drawItineraryWallpaper(ctx, params);
  return ctx;
}

export function createOffscreenWallpaperCanvas(
  width: number,
  height: number,
): WallpaperCanvas | null {
  return createOffscreenCanvas(width, height) as WallpaperCanvas | null;
}

type CanvasWithRaf = WallpaperCanvas & {
  requestAnimationFrame?: (callback: () => void) => number;
};

/** WeChat canvas 2d must finish painting before canvasToTempFilePath. */
export function flushCanvas2dDraw(canvas: CanvasWithRaf): Promise<void> {
  return new Promise((resolve) => {
    if (typeof canvas.requestAnimationFrame === 'function') {
      canvas.requestAnimationFrame(() => resolve());
      return;
    }
    if (typeof requestAnimationFrame === 'function') {
      requestAnimationFrame(() => resolve());
      return;
    }
    setTimeout(resolve, 32);
  });
}

export function exportWallpaperCanvasToTempFile(
  canvas: WallpaperCanvas,
  width: number,
  height: number,
): Promise<string> {
  return new Promise((resolve, reject) => {
    Taro.canvasToTempFilePath({
      // Offscreen canvas from map helper; WeChat accepts it at runtime.
      canvas: canvas as unknown as Parameters<
        typeof Taro.canvasToTempFilePath
      >[0]['canvas'],
      width,
      height,
      destWidth: width,
      destHeight: height,
      fileType: 'jpg',
      quality: 0.92,
      success: (res) => {
        if (res.tempFilePath) {
          resolve(res.tempFilePath);
          return;
        }
        reject(new Error('empty temp file path'));
      },
      fail: (err) => {
        reject(err ?? new Error('canvasToTempFilePath failed'));
      },
    });
  });
}

export async function renderWallpaperToOffscreenTempFile(
  params: ItineraryWallpaperDrawParams,
): Promise<string> {
  const canvas = createOffscreenWallpaperCanvas(params.width, params.height);
  if (!canvas) {
    throw new Error('offscreen canvas unsupported');
  }
  paintWallpaper(canvas, params);
  await flushCanvas2dDraw(canvas);
  return exportWallpaperCanvasToTempFile(canvas, params.width, params.height);
}

type PageCanvasNode = WallpaperCanvas & {
  width: number;
  height: number;
};

function isCanvas2dNode(node: unknown): node is PageCanvasNode {
  return node != null && typeof (node as PageCanvasNode).getContext === 'function';
}

/** Fallback when offscreen export is unavailable (page-level Canvas 2d). */
export async function renderWallpaperToPageCanvasTempFile(
  params: ItineraryWallpaperDrawParams,
): Promise<string> {
  const query = Taro.createSelectorQuery();
  const raw = await new Promise<
    | {
        node?: PageCanvasNode;
        width?: number;
        height?: number;
      }
    | undefined
  >((resolve) => {
    query
      .select(`#${ITINERARY_WALLPAPER_CANVAS_ID}`)
      .fields({ node: true, size: true })
      .exec((res) => {
        resolve(res?.[0] as { node?: PageCanvasNode } | undefined);
      });
  });

  const node = raw?.node;
  if (!node || !isCanvas2dNode(node)) {
    throw new Error('page canvas node not found');
  }

  // params.width/height are already physical pixels — do not multiply DPR again.
  node.width = params.width;
  node.height = params.height;

  const ctx = node.getContext('2d');
  if (!ctx) {
    throw new Error('canvas 2d context unavailable');
  }
  ctx.setTransform(1, 0, 0, 1, 0, 0);
  drawItineraryWallpaper(ctx, params);
  await flushCanvas2dDraw(node);

  return exportWallpaperCanvasToTempFile(node, params.width, params.height);
}
