import stormLogoSrc from "../../assets/images/storm-logo.png";
import {
  MAP_STORM_LOGO_CONTENT_TRIM,
  MAP_STORM_LOGO_GLOW_EXTRA_PX,
  MAP_STORM_LOGO_VISUAL_CENTER_NX,
  MAP_STORM_LOGO_VISUAL_CENTER_NY,
} from "./eventMapLayout";

type CanvasImageSource = Parameters<CanvasRenderingContext2D["drawImage"]>[0];

/** 打包后的 storm-logo 资源路径（微信小程序 Canvas createImage 使用） */
export const STORM_LOGO_SRC = stormLogoSrc;

/** 资源默认比例（920×602） */
const STORM_LOGO_FALLBACK_ASPECT = 920 / 602;

function readLogoAspect(logoImage: CanvasImageSource): number {
  const img = logoImage as CanvasImageSource & {
    width?: number;
    height?: number;
  };
  const w = img.width && img.width > 0 ? img.width : 920;
  const h = img.height && img.height > 0 ? img.height : 602;
  return w / h;
}

/** 可视中心（位图归一化坐标） */
export function getStormLogoVisualCenter(): { nx: number; ny: number } {
  return {
    nx: MAP_STORM_LOGO_VISUAL_CENTER_NX,
    ny: MAP_STORM_LOGO_VISUAL_CENTER_NY,
  };
}

/** size = 半高；按原图比例计算绘制宽高 */
export function getStormLogoDrawSize(
  halfHeight: number,
  logoImage?: CanvasImageSource | null,
): { drawW: number; drawH: number } {
  const drawH = halfHeight * 2 * MAP_STORM_LOGO_CONTENT_TRIM;
  const aspect = logoImage
    ? readLogoAspect(logoImage)
    : STORM_LOGO_FALLBACK_ASPECT;
  return { drawW: drawH * aspect, drawH };
}

/**
 * 将位图上的可视中心对齐到局部原点 (0,0)，供光晕与 drawImage 共用。
 */
function getStormLogoDrawOrigin(
  drawW: number,
  drawH: number,
): { originX: number; originY: number } {
  const { nx, ny } = getStormLogoVisualCenter();
  return {
    originX: -nx * drawW,
    originY: -ny * drawH,
  };
}

/** 可视中心到图标外轮廓顶点的最大距离（光晕与图标同心） */
function getStormLogoEnvelopeRadius(drawW: number, drawH: number): number {
  const { nx, ny } = getStormLogoVisualCenter();
  const corners: Array<[number, number]> = [
    [-nx * drawW, -ny * drawH],
    [(1 - nx) * drawW, -ny * drawH],
    [-nx * drawW, (1 - ny) * drawH],
    [(1 - nx) * drawW, (1 - ny) * drawH],
  ];
  let maxR = 0;
  for (const [cx, cy] of corners) {
    maxR = Math.max(maxR, Math.hypot(cx, cy));
  }
  return maxR;
}

/** 完整旋转一周（ms），约 50 秒 360° */
export const STORM_LOGO_FULL_ROTATION_MS = 30_000;

export function getStormLogoRotationAngle(timeMs: number): number {
  const period = STORM_LOGO_FULL_ROTATION_MS;
  const phase = ((timeMs % period) + period) % period;
  return (phase / period) * Math.PI * 2;
}

/** 静态光晕 + 慢速 360° 旋转（无呼吸脉冲） */
export function drawSlowRotatingStormLogo(
  ctx: CanvasRenderingContext2D,
  x: number,
  y: number,
  size: number,
  time: number,
  logoImage: CanvasImageSource | null | undefined,
) {
  if (!logoImage) {
    return;
  }

  const { drawW, drawH } = getStormLogoDrawSize(size, logoImage);
  const { originX, originY } = getStormLogoDrawOrigin(drawW, drawH);
  const glowR =
    getStormLogoEnvelopeRadius(drawW, drawH) + MAP_STORM_LOGO_GLOW_EXTRA_PX;

  ctx.save();
  try {
    ctx.translate(x, y);
    ctx.globalAlpha = 0.14;
    ctx.fillStyle = "#0077cc";
    ctx.beginPath();
    ctx.arc(0, 0, glowR, 0, Math.PI * 2);
    ctx.fill();
    ctx.globalAlpha = 1;
    ctx.rotate(getStormLogoRotationAngle(time));
    ctx.drawImage(logoImage, originX, originY, drawW, drawH);
  } finally {
    ctx.globalAlpha = 1;
    ctx.restore();
  }
}

export function drawOfficialStormLogoSlowRotateSafe(
  ctx: CanvasRenderingContext2D,
  x: number,
  y: number,
  size: number,
  time: number,
  logoImage: CanvasImageSource | null | undefined,
) {
  try {
    drawSlowRotatingStormLogo(ctx, x, y, size, time, logoImage);
  } catch (error) {
    console.warn("[eventMapStormLogo] slow-rotate fallback", error);
    ctx.save();
    ctx.translate(x, y);
    ctx.fillStyle = "#0d151c";
    ctx.beginPath();
    ctx.moveTo(0, -size);
    ctx.lineTo(size * 0.9, size * 0.75);
    ctx.lineTo(-size * 0.9, size * 0.75);
    ctx.closePath();
    ctx.fill();
    ctx.restore();
  }
}

/** 固定 LOGO + 静态光晕（不旋转、不呼吸） */
export function drawStaticStormLogo(
  ctx: CanvasRenderingContext2D,
  x: number,
  y: number,
  size: number,
  logoImage: CanvasImageSource | null | undefined,
) {
  if (!logoImage) {
    return;
  }

  const { drawW, drawH } = getStormLogoDrawSize(size, logoImage);
  const { originX, originY } = getStormLogoDrawOrigin(drawW, drawH);
  const glowR =
    getStormLogoEnvelopeRadius(drawW, drawH) + MAP_STORM_LOGO_GLOW_EXTRA_PX;

  ctx.save();
  try {
    ctx.translate(x, y);
    ctx.globalAlpha = 0.14;
    ctx.fillStyle = "#0077cc";
    ctx.beginPath();
    ctx.arc(0, 0, glowR, 0, Math.PI * 2);
    ctx.fill();
    ctx.globalAlpha = 1;
    ctx.drawImage(logoImage, originX, originY, drawW, drawH);
  } finally {
    ctx.globalAlpha = 1;
    ctx.restore();
  }
}

export function drawOfficialStormLogoStaticSafe(
  ctx: CanvasRenderingContext2D,
  x: number,
  y: number,
  size: number,
  logoImage: CanvasImageSource | null | undefined,
) {
  try {
    drawStaticStormLogo(ctx, x, y, size, logoImage);
  } catch (error) {
    console.warn("[eventMapStormLogo] static fallback", error);
    ctx.save();
    ctx.translate(x, y);
    ctx.fillStyle = "#0d151c";
    ctx.beginPath();
    ctx.moveTo(0, -size);
    ctx.lineTo(size * 0.9, size * 0.75);
    ctx.lineTo(-size * 0.9, size * 0.75);
    ctx.closePath();
    ctx.fill();
    ctx.restore();
  }
}

/** 绘制透明背景 + 旋转 + 轻量光晕（光晕圆心 = 图标可视中心） */
export function drawRotatingStormLogo(
  ctx: CanvasRenderingContext2D,
  x: number,
  y: number,
  size: number,
  time: number,
  logoImage: CanvasImageSource | null | undefined,
) {
  if (!logoImage) {
    return;
  }

  const { drawW, drawH } = getStormLogoDrawSize(size, logoImage);
  const { originX, originY } = getStormLogoDrawOrigin(drawW, drawH);
  const glowR =
    getStormLogoEnvelopeRadius(drawW, drawH) + MAP_STORM_LOGO_GLOW_EXTRA_PX;

  ctx.save();
  try {
    ctx.translate(x, y);

    const pulse = 0.5 + 0.5 * Math.sin(time * 0.003);
    ctx.globalAlpha = 0.08 + pulse * 0.1;
    ctx.fillStyle = "#0077cc";
    ctx.beginPath();
    ctx.arc(0, 0, glowR, 0, Math.PI * 2);
    ctx.fill();

    ctx.globalAlpha = 1;
    ctx.rotate(time * 0.0008);
    ctx.drawImage(logoImage, originX, originY, drawW, drawH);
  } finally {
    ctx.globalAlpha = 1;
    ctx.restore();
  }
}

export function drawOfficialStormLogo(
  ctx: CanvasRenderingContext2D,
  x: number,
  y: number,
  size: number,
  time: number,
  logoImage: CanvasImageSource | null | undefined,
) {
  drawRotatingStormLogo(ctx, x, y, size, time, logoImage);
}

export function drawOfficialStormLogoSafe(
  ctx: CanvasRenderingContext2D,
  x: number,
  y: number,
  size: number,
  time: number,
  logoImage: CanvasImageSource | null | undefined,
) {
  try {
    drawRotatingStormLogo(ctx, x, y, size, time, logoImage);
  } catch (error) {
    console.warn("[eventMapStormLogo] fallback", error);
    ctx.save();
    ctx.translate(x, y);
    ctx.fillStyle = "#0d151c";
    ctx.beginPath();
    ctx.moveTo(0, -size);
    ctx.lineTo(size * 0.9, size * 0.75);
    ctx.lineTo(-size * 0.9, size * 0.75);
    ctx.closePath();
    ctx.fill();
    ctx.restore();
  }
}

/** 旋转外接圆底边锚点（相对可视中心 y，用于连接线） */
export function stormLogoBottomOffset(
  size: number,
  logoImage?: CanvasImageSource | null,
): number {
  const { drawW, drawH } = getStormLogoDrawSize(size, logoImage);
  return getStormLogoEnvelopeRadius(drawW, drawH) * 0.92;
}
