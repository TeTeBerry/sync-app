import Taro from '@tarojs/taro';
import { createOffscreenCanvas } from '../../utils/offscreenCanvas';
import { drawVenueMapPin, venuePinExportMapScale } from './drawVenueMapPin';
import { VENUE_MAP_IMAGE_SRC } from './venueMapAsset';
import {
  markerExportPx,
  venueMapRegionHeightPx,
  venueMapRegionTopPx,
} from './venueMapRegion';
import type { VenueMapMarker } from './venueMapTypes';

export const VENUE_MAP_EXPORT_CANVAS_ID = 'sync-venue-map-export-canvas';

/** 导出宽度；标记尺寸按 displayMapWidthPx 等比缩放，与屏幕一致 */
const EXPORT_WIDTH = 750;

type ExportCanvas = HTMLCanvasElement & {
  getContext(contextId: '2d'): CanvasRenderingContext2D | null;
  createImage?: () => HTMLImageElement;
};

type CanvasImageSource = Parameters<CanvasRenderingContext2D['drawImage']>[0];

export type RenderVenueMapShareOptions = {
  /** 屏幕上地图显示宽度（与 useVenueMap fitVenueMapDisplaySize 一致） */
  displayMapWidthPx?: number;
};

async function loadMapImage(canvas: ExportCanvas): Promise<{
  image: CanvasImageSource;
  width: number;
  height: number;
}> {
  const info = await Taro.getImageInfo({ src: VENUE_MAP_IMAGE_SRC });
  const width = info.width;
  const height = info.height;

  if (typeof canvas.createImage === 'function') {
    const image = canvas.createImage();
    await new Promise<void>((resolve, reject) => {
      image.onload = () => resolve();
      image.onerror = () => reject(new Error('场馆图加载失败'));
      image.src = VENUE_MAP_IMAGE_SRC;
    });
    return { image: image as CanvasImageSource, width, height };
  }

  if (typeof Image !== 'undefined') {
    const image = new Image();
    await new Promise<void>((resolve, reject) => {
      image.onload = () => resolve();
      image.onerror = () => reject(new Error('场馆图加载失败'));
      image.src = VENUE_MAP_IMAGE_SRC;
    });
    return { image: image as CanvasImageSource, width, height };
  }

  throw new Error('无法加载场馆图');
}

async function paintShareCanvas(
  canvas: ExportCanvas,
  marker: VenueMapMarker,
  displayMapWidthPx: number,
): Promise<string> {
  const { image, width: srcW, height: srcH } = await loadMapImage(canvas);
  const regionTop = venueMapRegionTopPx(srcH);
  const regionHeight = venueMapRegionHeightPx(srcH);
  const exportHeight = Math.round((EXPORT_WIDTH * regionHeight) / srcW);
  canvas.width = EXPORT_WIDTH;
  canvas.height = exportHeight;

  const ctx = canvas.getContext('2d');
  if (!ctx) {
    throw new Error('canvas 2d 不可用');
  }

  ctx.drawImage(
    image,
    0,
    regionTop,
    srcW,
    regionHeight,
    0,
    0,
    EXPORT_WIDTH,
    exportHeight,
  );

  const { x: px, y: py } = markerExportPx(
    marker,
    srcW,
    srcH,
    EXPORT_WIDTH,
    exportHeight,
  );
  const mapScale = venuePinExportMapScale(EXPORT_WIDTH, displayMapWidthPx);
  drawVenueMapPin(ctx, px, py, marker.label, mapScale);

  return exportCanvasToTempFile(canvas);
}

function exportCanvasToTempFile(canvas: ExportCanvas): Promise<string> {
  return new Promise((resolve, reject) => {
    Taro.canvasToTempFilePath({
      canvas: canvas as unknown as Parameters<
        typeof Taro.canvasToTempFilePath
      >[0]['canvas'],
      x: 0,
      y: 0,
      width: canvas.width,
      height: canvas.height,
      destWidth: canvas.width,
      destHeight: canvas.height,
      fileType: 'png',
      quality: 1,
      success: (res) => {
        if (res.tempFilePath) resolve(res.tempFilePath);
        else reject(new Error('导出图片失败'));
      },
      fail: (err) => reject(err),
    });
  });
}

async function renderOnPageCanvas(
  marker: VenueMapMarker,
  displayMapWidthPx: number,
): Promise<string> {
  return new Promise((resolve, reject) => {
    const query = Taro.createSelectorQuery();
    query
      .select(`#${VENUE_MAP_EXPORT_CANVAS_ID}`)
      .fields({ node: true, size: true })
      .exec(async (res) => {
        const node = res?.[0]?.node as ExportCanvas | undefined;
        if (!node) {
          reject(new Error('导出 canvas 未就绪'));
          return;
        }
        try {
          resolve(await paintShareCanvas(node, marker, displayMapWidthPx));
        } catch (e) {
          reject(e);
        }
      });
  });
}

export async function renderVenueMapShareImage(
  marker: VenueMapMarker,
  options?: RenderVenueMapShareOptions,
): Promise<string> {
  const displayMapWidthPx = options?.displayMapWidthPx ?? 375;
  const offscreen = createOffscreenCanvas(EXPORT_WIDTH, 1200) as ExportCanvas | null;
  if (offscreen) {
    return paintShareCanvas(offscreen, marker, displayMapWidthPx);
  }
  return renderOnPageCanvas(marker, displayMapWidthPx);
}
