import Taro from '@tarojs/taro';
import { createOffscreenCanvas } from '@/utils/offscreenCanvas';
import { t } from '@/i18n';
import type { SetVoteLeaderboardEntry, SetVotePick } from '@/types/activity';
import {
  drawCanvasCoverImage,
  drawPosterReadabilityOverlay,
  fetchPosterAiBackgroundUrl,
} from '@/domains/share/utils/posterAiBackground';

export const SET_VOTE_POSTER_CANVAS_ID = 'sync-set-vote-poster-canvas';

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
  const words = text.split('');
  let line = '';
  let cursorY = y;
  for (const ch of words) {
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

export async function renderSetVotePosterToTempFile(input: {
  activityLegacyId?: number;
  activityName: string;
  picks: SetVotePick[];
  topEntries: SetVoteLeaderboardEntry[];
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

  const aiBackgroundUrl =
    input.activityLegacyId && input.activityLegacyId > 0
      ? await fetchPosterAiBackgroundUrl({
          kind: 'set_vote',
          activityLegacyId: input.activityLegacyId,
          activityName: input.activityName,
        })
      : null;

  if (aiBackgroundUrl) {
    try {
      await drawCanvasCoverImage(ctx, canvas, aiBackgroundUrl, WIDTH, HEIGHT);
      drawPosterReadabilityOverlay(ctx, WIDTH, HEIGHT);
    } catch {
      drawSetVoteFallbackBackground(ctx);
    }
  } else {
    drawSetVoteFallbackBackground(ctx);
  }

  ctx.fillStyle = '#ffffff';
  ctx.font = 'bold 40px sans-serif';
  let y = 80;
  y = wrapText(ctx, input.activityName, 48, y, WIDTH - 96, 52);

  ctx.fillStyle = '#c4b5fd';
  ctx.font = '28px sans-serif';
  y += 24;
  ctx.fillText(t('setVote.posterMyPicks'), 48, y);
  y += 48;

  ctx.fillStyle = '#f8fafc';
  ctx.font = '32px sans-serif';
  for (const pick of input.picks) {
    y = wrapText(ctx, `• ${pick.artistName}`, 64, y, WIDTH - 112, 44);
  }

  y += 16;
  ctx.fillStyle = '#c4b5fd';
  ctx.font = '28px sans-serif';
  ctx.fillText(t('setVote.posterTop3'), 48, y);
  y += 48;

  ctx.fillStyle = '#e2e8f0';
  ctx.font = '30px sans-serif';
  for (const entry of input.topEntries.slice(0, 3)) {
    y = wrapText(
      ctx,
      `${entry.artistName} · ${entry.voteCount}`,
      64,
      y,
      WIDTH - 112,
      42,
    );
  }

  y = HEIGHT - 120;
  ctx.fillStyle = '#94a3b8';
  ctx.font = '22px sans-serif';
  wrapText(ctx, t('setVote.posterDisclaimer'), 48, y, WIDTH - 96, 30);

  return exportCanvasToTempFile(canvas, WIDTH, HEIGHT);
}

function drawSetVoteFallbackBackground(ctx: CanvasRenderingContext2D): void {
  const gradient = ctx.createLinearGradient(0, 0, WIDTH, HEIGHT);
  gradient.addColorStop(0, '#1a1033');
  gradient.addColorStop(1, '#0b1020');
  ctx.fillStyle = gradient;
  ctx.fillRect(0, 0, WIDTH, HEIGHT);
}
