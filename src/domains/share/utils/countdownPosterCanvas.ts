import Taro from '@tarojs/taro';
import { createOffscreenCanvas } from '@/utils/offscreenCanvas';
import { t } from '@/i18n';
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
): number {
  const chars = text.split('');
  let line = '';
  let cursorY = y;
  for (const ch of chars) {
    const test = line + ch;
    if (ctx.measureText(test).width > maxWidth && line) {
      ctx.fillText(line, x, cursorY);
      line = ch;
      cursorY += lineHeight;
    } else {
      line = test;
    }
  }
  if (line) {
    ctx.fillText(line, x, cursorY);
    cursorY += lineHeight;
  }
  return cursorY;
}

function drawFallbackBackground(ctx: CanvasRenderingContext2D): void {
  const gradient = ctx.createLinearGradient(0, 0, WIDTH, HEIGHT);
  gradient.addColorStop(0, '#120a24');
  gradient.addColorStop(1, '#081018');
  ctx.fillStyle = gradient;
  ctx.fillRect(0, 0, WIDTH, HEIGHT);
}

export async function renderCountdownPosterToTempFile(input: {
  activityLegacyId: number;
  activityName: string;
  activityDate?: string;
  activityLocation?: string;
  daysUntil: number;
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
    kind: 'countdown',
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

  ctx.textAlign = 'center';
  ctx.fillStyle = '#4cc9f0';
  ctx.font = '600 28px sans-serif';
  ctx.fillText(t('countdownPoster.badge'), WIDTH / 2, 100);

  ctx.fillStyle = '#ffffff';
  ctx.font = '800 120px sans-serif';
  ctx.fillText(String(input.daysUntil), WIDTH / 2, 340);

  ctx.fillStyle = '#c4b5fd';
  ctx.font = 'bold 44px sans-serif';
  ctx.fillText(t('countdown.days'), WIDTH / 2, 410);

  ctx.fillStyle = '#f8fafc';
  ctx.font = 'bold 38px sans-serif';
  let y = wrapText(ctx, input.activityName, 48, 520, WIDTH - 96, 44);

  ctx.textAlign = 'center';
  ctx.fillStyle = '#e2e8f0';
  ctx.font = '30px sans-serif';
  const meta = [input.activityDate, input.activityLocation].filter(Boolean).join(' · ');
  if (meta) {
    y = wrapText(ctx, meta, 48, y + 20, WIDTH - 96, 38);
  }

  ctx.fillStyle = '#cbd5e1';
  ctx.font = '28px sans-serif';
  wrapText(
    ctx,
    t('countdown.untilStart', { eventName: input.activityName }),
    48,
    y + 24,
    WIDTH - 96,
    36,
  );

  ctx.textAlign = 'left';
  y = HEIGHT - 120;
  ctx.fillStyle = '#94a3b8';
  ctx.font = '22px sans-serif';
  wrapText(ctx, t('countdownPoster.disclaimer'), 48, y, WIDTH - 96, 30);

  return exportCanvasToTempFile(canvas, WIDTH, HEIGHT);
}
