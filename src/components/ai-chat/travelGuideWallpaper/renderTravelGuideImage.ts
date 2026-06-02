import Taro from '@tarojs/taro';
import { createOffscreenCanvas } from '../../../utils/offscreenCanvas';
import {
  drawTravelGuideWallpaper,
  measureTravelGuideWallpaperHeight,
} from './travelGuideWallpaperDraw';
import type { TravelGuidePlan } from '../../../types/travelGuide';

export const TRAVEL_GUIDE_CANVAS_ID = 'sync-travel-guide-canvas';

/** 微信单张 canvas 建议不超过 4096，留余量（页面 Canvas 回退时用） */
export const TRAVEL_GUIDE_MAX_CANVAS_HEIGHT = 4096;

type GuideCanvas = HTMLCanvasElement & {
  getContext(contextId: '2d'): CanvasRenderingContext2D | null;
};

function exportCanvas(canvas: GuideCanvas): Promise<string> {
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
        else reject(new Error('empty temp file'));
      },
      fail: (err) => reject(err),
    });
  });
}

async function renderOnPageCanvas(plan: TravelGuidePlan): Promise<string> {
  return new Promise((resolve, reject) => {
    const query = Taro.createSelectorQuery();
    query
      .select(`#${TRAVEL_GUIDE_CANVAS_ID}`)
      .fields({ node: true, size: true })
      .exec(async (res) => {
        const node = res?.[0]?.node as GuideCanvas | undefined;
        if (!node) {
          reject(new Error('page canvas not found'));
          return;
        }
        try {
          const height = measureTravelGuideWallpaperHeight(plan);
          node.width = 750;
          node.height = height;
          drawTravelGuideWallpaper(node, plan);
          resolve(await exportCanvas(node));
        } catch (e) {
          reject(e);
        }
      });
  });
}

export async function renderTravelGuideImage(plan: TravelGuidePlan): Promise<string> {
  const height = measureTravelGuideWallpaperHeight(plan);
  const offscreen = createOffscreenCanvas(750, height) as GuideCanvas | null;
  if (offscreen) {
    drawTravelGuideWallpaper(offscreen, plan);
    return exportCanvas(offscreen);
  }
  return renderOnPageCanvas(plan);
}

export { shareTravelGuideImage } from '../../../utils/travelGuideShare';
