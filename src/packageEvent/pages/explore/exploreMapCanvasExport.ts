import Taro from '@tarojs/taro';
import { createOffscreenCanvas } from '../../../utils/offscreenCanvas';

type PaintCanvas = HTMLCanvasElement & {
  getContext(contextId: '2d'): CanvasRenderingContext2D | null;
};

export function createExplorePaintCanvas(
  width: number,
  height: number,
): PaintCanvas | null {
  return createOffscreenCanvas(width, height) as PaintCanvas | null;
}

export function exportExploreCanvasToPng(
  canvas: PaintCanvas,
  width: number,
  height: number,
): Promise<string> {
  return new Promise((resolve, reject) => {
    Taro.canvasToTempFilePath({
      canvas: canvas as unknown as Parameters<
        typeof Taro.canvasToTempFilePath
      >[0]['canvas'],
      width,
      height,
      destWidth: width,
      destHeight: height,
      fileType: 'png',
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
