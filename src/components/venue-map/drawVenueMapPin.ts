import { VENUE_PIN_BUBBLE_PX, VENUE_PIN_GAP_PX } from './venueMapPinMetrics';

/** 与 fitVenueMapDisplaySize 默认参考宽一致 */
export const VENUE_MAP_DISPLAY_REF_WIDTH = 375;

function roundRect(
  ctx: CanvasRenderingContext2D,
  x: number,
  y: number,
  w: number,
  h: number,
  r: number,
) {
  const radius = Math.min(r, w / 2, h / 2);
  ctx.beginPath();
  ctx.moveTo(x + radius, y);
  ctx.arcTo(x + w, y, x + w, y + h, radius);
  ctx.arcTo(x + w, y + h, x, y + h, radius);
  ctx.arcTo(x, y + h, x, y, radius);
  ctx.arcTo(x, y, x + w, y, radius);
  ctx.closePath();
}

function exportLabelFont(fontSizePx: number): string {
  const size = Math.max(10, Math.round(fontSizePx));
  return `600 ${size}px "PingFang SC", -apple-system, BlinkMacSystemFont, "Helvetica Neue", sans-serif`;
}

function measureLabelWidth(
  ctx: CanvasRenderingContext2D,
  text: string,
  fontSizePx: number,
): number {
  ctx.font = exportLabelFont(fontSizePx);
  const measured = ctx.measureText(text).width;
  if (Number.isFinite(measured) && measured > 1) {
    return measured;
  }
  let fallback = 0;
  for (const ch of text) {
    fallback += ch.charCodeAt(0) > 255 ? fontSizePx : fontSizePx * 0.58;
  }
  return fallback;
}

/**
 * 在 canvas 上绘制与页面一致的标记（尖角 anchor = tipX/tipY）
 * @param mapScale 导出地图宽 / 屏幕地图宽（如 750/375=2）
 */
export function drawVenueMapPin(
  ctx: CanvasRenderingContext2D,
  tipX: number,
  tipY: number,
  label: string,
  mapScale: number,
): void {
  const s = Math.max(0.5, mapScale);
  const bubble = VENUE_PIN_BUBBLE_PX * s;
  const gap = VENUE_PIN_GAP_PX * s;
  const labelFont = 11 * s;
  const labelPadX = 8 * s;
  const labelPadY = 3 * s;
  const labelRadius = 6 * s;
  const borderW = Math.max(1, 1.5 * s);

  const text = label.trim();
  let labelBoxH = 0;
  let labelBoxW = 0;
  let labelBoxY = tipY - bubble - gap;

  if (text) {
    labelBoxH = labelPadY * 2 + labelFont;
    labelBoxW = measureLabelWidth(ctx, text, labelFont) + labelPadX * 2;
    labelBoxY = tipY - bubble - gap - labelBoxH;
  }

  if (text) {
    const boxX = tipX - labelBoxW / 2;
    ctx.save();
    ctx.font = exportLabelFont(labelFont);
    ctx.fillStyle = 'rgba(14, 11, 22, 0.9)';
    roundRect(ctx, boxX, labelBoxY, labelBoxW, labelBoxH, labelRadius);
    ctx.fill();
    ctx.strokeStyle = 'rgba(255, 77, 141, 0.5)';
    ctx.lineWidth = borderW;
    ctx.stroke();
    ctx.fillStyle = '#ffffff';
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.fillText(text, tipX, labelBoxY + labelBoxH / 2);
    ctx.restore();
  }

  const bubbleX = tipX - bubble / 2;
  const bubbleY = tipY - bubble;
  ctx.save();
  const grad = ctx.createLinearGradient(
    bubbleX,
    bubbleY,
    bubbleX + bubble,
    bubbleY + bubble,
  );
  grad.addColorStop(0, '#ff2d6a');
  grad.addColorStop(1, '#ff4d8d');
  ctx.fillStyle = grad;
  roundRect(ctx, bubbleX, bubbleY, bubble, bubble, 3 * s);
  ctx.fill();
  ctx.strokeStyle = '#ffffff';
  ctx.lineWidth = 2 * s;
  ctx.stroke();
  ctx.restore();
}

/** 导出图标记相对屏幕的缩放（exportMapWidth 通常为 750，displayMapWidth 为 viewWidth） */
export function venuePinExportMapScale(
  exportMapWidthPx: number,
  displayMapWidthPx: number = VENUE_MAP_DISPLAY_REF_WIDTH,
): number {
  const display = Math.max(1, displayMapWidthPx);
  return exportMapWidthPx / display;
}
