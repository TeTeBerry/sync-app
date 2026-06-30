import Taro from '@tarojs/taro';
import { createOffscreenCanvas } from '@/utils/offscreenCanvas';
import { t } from '@/i18n';
import type { AiBuddyPostFormValues } from '@/types/buddyPost';
import { buildBuddyPostBody } from '@/utils/buddyPostForm';
import {
  drawCanvasCoverImage,
  drawPosterReadabilityOverlay,
  fetchPosterAiBackgroundUrl,
} from '@/domains/share/utils/posterAiBackground';

const WIDTH = 750;
const HEIGHT = 1200;

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

function wrapText(
  ctx: CanvasRenderingContext2D,
  text: string,
  x: number,
  y: number,
  maxWidth: number,
  lineHeight: number,
  maxLines = 0,
): number {
  const chars = text.split('');
  let line = '';
  let cursorY = y;
  let lineCount = 0;
  for (const ch of chars) {
    const test = line + ch;
    if (ctx.measureText(test).width > maxWidth && line) {
      ctx.fillText(line, x, cursorY);
      line = ch;
      cursorY += lineHeight;
      lineCount += 1;
      if (maxLines > 0 && lineCount >= maxLines) {
        return cursorY;
      }
    } else {
      line = test;
    }
  }
  if (line && (maxLines === 0 || lineCount < maxLines)) {
    ctx.fillText(line, x, cursorY);
    cursorY += lineHeight;
  }
  return cursorY;
}

function drawFallbackBackground(ctx: CanvasRenderingContext2D): void {
  const gradient = ctx.createLinearGradient(0, 0, WIDTH, HEIGHT);
  gradient.addColorStop(0, '#1a1033');
  gradient.addColorStop(1, '#0b1020');
  ctx.fillStyle = gradient;
  ctx.fillRect(0, 0, WIDTH, HEIGHT);
}

export async function renderRecruitPostPosterToTempFile(input: {
  activityLegacyId: number;
  activityName: string;
  form: AiBuddyPostFormValues;
}): Promise<string> {
  const canvas = createOffscreenCanvas(WIDTH, HEIGHT) as PosterCanvas | null;
  if (!canvas) {
    throw new Error('offscreen canvas unsupported');
  }

  canvas.width = WIDTH;
  canvas.height = HEIGHT;
  const ctx = canvas.getContext('2d');
  if (!ctx) {
    throw new Error('canvas 2d context unavailable');
  }

  const aiBackgroundUrl = await fetchPosterAiBackgroundUrl({
    kind: 'recruit_post',
    activityLegacyId: input.activityLegacyId,
    activityName: input.activityName,
  });

  if (aiBackgroundUrl) {
    try {
      await drawCanvasCoverImage(ctx, canvas, aiBackgroundUrl, WIDTH, HEIGHT);
      drawPosterReadabilityOverlay(ctx, WIDTH, HEIGHT);
    } catch {
      drawFallbackBackground(ctx);
    }
  } else {
    drawFallbackBackground(ctx);
  }

  const summary = buildBuddyPostBody(input.form);

  ctx.fillStyle = '#ff4d8d';
  ctx.font = '600 28px sans-serif';
  ctx.fillText(t('recruitPoster.badge'), 48, 72);

  ctx.fillStyle = '#ffffff';
  ctx.font = 'bold 40px sans-serif';
  let y = wrapText(ctx, input.activityName, 48, 120, WIDTH - 96, 48);

  y += 16;
  ctx.fillStyle = '#c4b5fd';
  ctx.font = '28px sans-serif';
  ctx.fillText(t('recruitPoster.sectionPublicRecruit'), 48, y);
  y += 44;

  ctx.fillStyle = '#f8fafc';
  ctx.font = '32px sans-serif';
  y = wrapText(ctx, summary, 64, y, WIDTH - 112, 40, 2);

  y = HEIGHT - 120;
  ctx.fillStyle = '#94a3b8';
  ctx.font = '22px sans-serif';
  wrapText(ctx, t('recruitPoster.disclaimer'), 48, y, WIDTH - 96, 30);

  return exportCanvasToTempFile(canvas, WIDTH, HEIGHT);
}
