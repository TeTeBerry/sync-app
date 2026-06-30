import Taro from '@tarojs/taro';
import { createOffscreenCanvas } from '@/utils/offscreenCanvas';
import { PERSONALITY_POSTER_DESIGN } from '../constants/posterDesign';
import {
  drawPersonalityPoster,
  type PersonalityPosterInput,
} from './personalityPosterDraw';
import { fetchPosterAiBackgroundUrl } from '@/domains/share/utils/posterAiBackground';

export const PERSONALITY_POSTER_CANVAS_ID = 'sync-personality-poster-canvas';

type PosterCanvas = HTMLCanvasElement & {
  getContext(contextId: '2d'): CanvasRenderingContext2D | null;
  createImage?: () => HTMLImageElement;
};

function exportCanvasToTempFile(
  canvas: PosterCanvas,
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
      fail: (err) => reject(err ?? new Error('canvasToTempFilePath failed')),
    });
  });
}

export async function renderPersonalityPosterToTempFile(
  input: PersonalityPosterInput,
): Promise<string> {
  const { width, height } = PERSONALITY_POSTER_DESIGN;
  const canvas = createOffscreenCanvas(width, height) as PosterCanvas | null;
  if (!canvas) {
    throw new Error('offscreen canvas unsupported');
  }

  canvas.width = width;
  canvas.height = height;
  const ctx = canvas.getContext('2d');
  if (!ctx) {
    throw new Error('canvas 2d context unavailable');
  }

  const backgroundImageUrl = await fetchPosterAiBackgroundUrl({
    kind: 'personality_test',
    personalityType: input.result.score.primaryType,
  });

  await drawPersonalityPoster(ctx, { ...input, backgroundImageUrl }, canvas);
  return exportCanvasToTempFile(canvas, width, height);
}
