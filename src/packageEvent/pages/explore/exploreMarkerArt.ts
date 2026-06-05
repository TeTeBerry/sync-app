import {
  EXPLORE_COLOR_ONSITE,
  EXPLORE_COLOR_PULSE,
  EXPLORE_COLOR_WANT,
  EXPLORE_NEON_GRADIENT,
  EXPLORE_WANT_AVATAR_BG,
} from './exploreMapColors';
import {
  createExplorePaintCanvas,
  exportExploreCanvasToPng,
} from './exploreMapCanvasExport';
import type { ExploreUserStatus } from './exploreMapTypes';

export const EXPLORE_MARKER_FRAME_COUNT = 8;

const OTHER_AVATAR_PX = 40;
const SELF_AVATAR_PX = 52;

type MarkerPaintOpts = {
  status: ExploreUserStatus;
  isSelf: boolean;
  frameIndex: number;
  initial: string;
  /** 聚合数字气泡 */
  clusterCount?: number;
};

function rippleColor(status: ExploreUserStatus): string {
  if (status === 'want') return EXPLORE_COLOR_WANT;
  if (status === 'pulse') return EXPLORE_COLOR_PULSE;
  return EXPLORE_COLOR_ONSITE;
}

function canvasSize(isSelf: boolean, isCluster: boolean): number {
  if (isCluster) return 88;
  if (isSelf) return 104;
  return 80;
}

function drawRippleRings(
  ctx: CanvasRenderingContext2D,
  cx: number,
  cy: number,
  frameIndex: number,
  color: string,
  maxRadius: number,
  ringWidth: number,
) {
  const phase = (frameIndex / EXPLORE_MARKER_FRAME_COUNT) * Math.PI * 2;
  for (let i = 0; i < 3; i += 1) {
    const offset = (i * Math.PI * 2) / 3;
    const t = (phase + offset) % (Math.PI * 2);
    const progress = t / (Math.PI * 2);
    const radius = 14 + progress * maxRadius;
    const alpha = 0.55 * (1 - progress);
    ctx.beginPath();
    ctx.arc(cx, cy, radius, 0, Math.PI * 2);
    ctx.strokeStyle = color;
    ctx.globalAlpha = alpha;
    ctx.lineWidth = ringWidth;
    ctx.stroke();
  }
  ctx.globalAlpha = 1;
}

function drawAvatar(
  ctx: CanvasRenderingContext2D,
  cx: number,
  cy: number,
  radius: number,
  opts: MarkerPaintOpts,
) {
  const { status, isSelf, initial } = opts;
  const borderW = isSelf ? 4 : 1.5;
  const borderColor = isSelf ? '#ffffff' : 'rgba(255,255,255,0.55)';

  if (status === 'want') {
    ctx.fillStyle = EXPLORE_WANT_AVATAR_BG;
  } else {
    const g = ctx.createLinearGradient(
      cx - radius,
      cy - radius,
      cx + radius,
      cy + radius,
    );
    g.addColorStop(0, EXPLORE_NEON_GRADIENT[0]);
    g.addColorStop(1, EXPLORE_NEON_GRADIENT[1]);
    ctx.fillStyle = g;
  }

  ctx.beginPath();
  ctx.arc(cx, cy, radius, 0, Math.PI * 2);
  ctx.fill();

  if (status === 'pulse') {
    ctx.shadowColor = EXPLORE_COLOR_PULSE;
    ctx.shadowBlur = isSelf ? 22 : 14;
  }

  ctx.lineWidth = borderW;
  ctx.strokeStyle = borderColor;
  ctx.stroke();
  ctx.shadowBlur = 0;

  ctx.fillStyle = '#ffffff';
  ctx.font = `bold ${Math.round(radius * 0.9)}px sans-serif`;
  ctx.textAlign = 'center';
  ctx.textBaseline = 'middle';
  ctx.fillText(initial.slice(0, 1).toUpperCase(), cx, cy + 1);
}

export function drawExploreMarkerFrame(
  ctx: CanvasRenderingContext2D,
  size: number,
  opts: MarkerPaintOpts,
): void {
  const cx = size / 2;
  const cy = size / 2;
  const isCluster = opts.clusterCount != null;
  const isSelf = opts.isSelf && !isCluster;
  const color = rippleColor(opts.status);
  const maxR = isCluster ? 30 : isSelf ? 34 : opts.status === 'pulse' ? 28 : 22;
  const ringW = isSelf ? 2.8 : 2;

  ctx.clearRect(0, 0, size, size);

  if (isSelf) {
    drawRippleRings(ctx, cx, cy, opts.frameIndex + 2, color, maxR + 10, ringW + 0.6);
  }

  drawRippleRings(ctx, cx, cy, opts.frameIndex, color, maxR, ringW);

  if (isCluster) {
    ctx.fillStyle = 'rgba(123, 77, 255, 0.35)';
    ctx.beginPath();
    ctx.arc(cx, cy, 14, 0, Math.PI * 2);
    ctx.fill();
    return;
  }

  const avatarR = (isSelf ? SELF_AVATAR_PX : OTHER_AVATAR_PX) / 2;
  drawAvatar(ctx, cx, cy, avatarR, opts);
}

async function exportFrame(opts: MarkerPaintOpts): Promise<string> {
  const isCluster = opts.clusterCount != null;
  const size = canvasSize(opts.isSelf, isCluster);
  const canvas = createExplorePaintCanvas(size, size);
  if (!canvas) {
    throw new Error('offscreen canvas unavailable');
  }
  canvas.width = size;
  canvas.height = size;
  const ctx = canvas.getContext('2d');
  if (!ctx) {
    throw new Error('canvas 2d unavailable');
  }
  drawExploreMarkerFrame(ctx, size, opts);
  return exportExploreCanvasToPng(canvas, size, size);
}

export type MarkerIconSet = {
  frames: string[];
  size: number;
  anchorY: number;
};

function cacheKey(opts: {
  status: ExploreUserStatus;
  isSelf: boolean;
  cluster?: boolean;
  initial?: string;
}): string {
  if (opts.cluster) return `cluster-${opts.status}`;
  return `user-${opts.status}-${opts.isSelf ? 'self' : 'other'}`;
}

const iconCache = new Map<string, MarkerIconSet>();

export async function getMarkerIconSet(opts: {
  status: ExploreUserStatus;
  isSelf: boolean;
  initial?: string;
  cluster?: boolean;
}): Promise<MarkerIconSet> {
  const key = cacheKey(opts);
  const hit = iconCache.get(key);
  if (hit) return hit;

  const isCluster = opts.cluster === true;
  const size = canvasSize(opts.isSelf, isCluster);
  const frames: string[] = [];
  for (let i = 0; i < EXPLORE_MARKER_FRAME_COUNT; i += 1) {
    const path = await exportFrame({
      status: opts.status,
      isSelf: opts.isSelf,
      frameIndex: i,
      initial: opts.initial ?? 'S',
      clusterCount: isCluster ? 12 : undefined,
    });
    frames.push(path);
  }

  const anchorY = size / 2;
  const set: MarkerIconSet = { frames, size, anchorY };
  iconCache.set(key, set);
  return set;
}

export function getMarkerIconPath(set: MarkerIconSet, frameIndex: number): string {
  return set.frames[frameIndex % set.frames.length] ?? set.frames[0];
}

let venuePinPath: string | null = null;

/** 17 号馆固定锚点（不参与波纹动画） */
export async function getVenueHallPinIcon(): Promise<string> {
  if (venuePinPath) return venuePinPath;
  const size = 32;
  const canvas = createExplorePaintCanvas(size, size);
  if (!canvas) throw new Error('offscreen canvas unavailable');
  canvas.width = size;
  canvas.height = size;
  const ctx = canvas.getContext('2d');
  if (!ctx) throw new Error('canvas 2d unavailable');
  const cx = size / 2;
  const cy = size / 2 + 2;
  ctx.clearRect(0, 0, size, size);
  ctx.fillStyle = '#ff4899';
  ctx.strokeStyle = '#ffffff';
  ctx.lineWidth = 2;
  ctx.beginPath();
  ctx.moveTo(cx, cy - 12);
  ctx.lineTo(cx + 10, cy + 8);
  ctx.lineTo(cx - 10, cy + 8);
  ctx.closePath();
  ctx.fill();
  ctx.stroke();
  ctx.beginPath();
  ctx.arc(cx, cy + 2, 4, 0, Math.PI * 2);
  ctx.fillStyle = '#ffffff';
  ctx.fill();
  venuePinPath = await exportExploreCanvasToPng(canvas, size, size);
  return venuePinPath;
}
