import Taro from "@tarojs/taro";
import { createMapOffscreenCanvas } from "../../../components/event-map/mapOffscreenCanvas";
import { drawItineraryWallpaper, estimateWallpaperContentHeight } from "./itineraryWallpaperDraw";
import type { ItineraryWallpaperDrawParams } from "./itineraryWallpaperDraw";
import type { ItineraryWallpaperSection } from "./itineraryWallpaperParse";

export const ITINERARY_WALLPAPER_CANVAS_ID = "sync-itinerary-wallpaper-canvas";

type WallpaperCanvas = HTMLCanvasElement & {
  getContext(contextId: "2d"): CanvasRenderingContext2D | null;
};

export type WallpaperCanvasSize = {
  width: number;
  height: number;
  scaleFactor: number;
};

/**
 * Device-aware wallpaper pixel size using window metrics and pixelRatio.
 * Height grows with multi-date content but stays at least lock-screen aspect.
 */
export function getWallpaperCanvasSize(
  sections: ItineraryWallpaperSection[],
  eventMeta?: string,
): WallpaperCanvasSize {
  try {
    const sys = Taro.getSystemInfoSync?.() ?? {};
    const win = Taro.getWindowInfo();
    const windowWidth = win.windowWidth ?? sys.windowWidth ?? 390;
    const windowHeight = win.windowHeight ?? sys.windowHeight ?? 844;
    const pixelRatio = Math.min(3, win.pixelRatio ?? sys.pixelRatio ?? 2);

    const scaleFactor = windowWidth / 390;
    const width = Math.min(1080, Math.max(720, Math.round(windowWidth * pixelRatio)));

    const deviceHeight = Math.round(windowHeight * pixelRatio);
    const contentHeight = estimateWallpaperContentHeight(sections, width, scaleFactor, eventMeta);
    const height = Math.min(
      3200,
      Math.max(deviceHeight, contentHeight, Math.round((width * 19.5) / 9)),
    );

    return { width, height, scaleFactor };
  } catch {
    const width = 1080;
    const scaleFactor = width / 390;
    const contentHeight = estimateWallpaperContentHeight(sections, width, scaleFactor, eventMeta);
    return {
      width,
      height: Math.max(1920, contentHeight),
      scaleFactor,
    };
  }
}

/** @deprecated Use getWallpaperCanvasSize */
export function resolveWallpaperPixelSize(
  sections: ItineraryWallpaperSection[] = [],
  eventMeta?: string,
): WallpaperCanvasSize {
  return getWallpaperCanvasSize(sections, eventMeta);
}

function paintWallpaper(
  canvas: WallpaperCanvas,
  params: ItineraryWallpaperDrawParams,
): CanvasRenderingContext2D {
  const { width, height } = params;
  canvas.width = width;
  canvas.height = height;
  const ctx = canvas.getContext("2d");
  if (!ctx) {
    throw new Error("canvas 2d context unavailable");
  }
  drawItineraryWallpaper(ctx, params);
  return ctx;
}

export function createOffscreenWallpaperCanvas(
  width: number,
  height: number,
): WallpaperCanvas | null {
  return createMapOffscreenCanvas(width, height) as WallpaperCanvas | null;
}

export function exportWallpaperCanvasToTempFile(
  canvas: WallpaperCanvas,
  width: number,
  height: number,
): Promise<string> {
  return new Promise((resolve, reject) => {
    Taro.canvasToTempFilePath({
      // Offscreen canvas from map helper; WeChat accepts it at runtime.
      canvas: canvas as unknown as Parameters<typeof Taro.canvasToTempFilePath>[0]["canvas"],
      width,
      height,
      destWidth: width,
      destHeight: height,
      fileType: "png",
      success: (res) => {
        if (res.tempFilePath) {
          resolve(res.tempFilePath);
          return;
        }
        reject(new Error("empty temp file path"));
      },
      fail: (err) => {
        reject(err ?? new Error("canvasToTempFilePath failed"));
      },
    });
  });
}

export async function renderWallpaperToOffscreenTempFile(
  params: ItineraryWallpaperDrawParams,
): Promise<string> {
  const canvas = createOffscreenWallpaperCanvas(params.width, params.height);
  if (!canvas) {
    throw new Error("offscreen canvas unsupported");
  }
  paintWallpaper(canvas, params);
  return exportWallpaperCanvasToTempFile(canvas, params.width, params.height);
}

type PageCanvasNode = WallpaperCanvas & {
  width: number;
  height: number;
};

function isCanvas2dNode(node: unknown): node is PageCanvasNode {
  return node != null && typeof (node as PageCanvasNode).getContext === "function";
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
    throw new Error("page canvas node not found");
  }

  const dpr = Math.min(2, Taro.getWindowInfo().pixelRatio ?? 2);
  node.width = Math.round(params.width * dpr);
  node.height = Math.round(params.height * dpr);

  const ctx = node.getContext("2d");
  if (!ctx) {
    throw new Error("canvas 2d context unavailable");
  }
  ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
  drawItineraryWallpaper(ctx, params);

  return exportWallpaperCanvasToTempFile(node, params.width, params.height);
}
