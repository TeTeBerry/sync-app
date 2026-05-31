import type { ItineraryWallpaperSection } from "./itineraryWallpaperParse";
import type { ItineraryWallpaperRow } from "./itineraryWallpaperParse";
import { sectionStyleForIndex, WALLPAPER_ACCENT, WALLPAPER_THEME } from "./itineraryWallpaperTheme";

export type ItineraryWallpaperDrawParams = {
  width: number;
  height: number;
  sections: ItineraryWallpaperSection[];
  eventMeta?: string;
  /** Device scale for fonts/spacing; defaults to width / 390. */
  scaleFactor?: number;
};

const DESIGN_WIDTH = 390;

function scale(width: number, scaleFactor?: number): number {
  return scaleFactor ?? width / DESIGN_WIDTH;
}

export type WallpaperLayout = {
  s: number;
  pad: number;
  timelineX: number;
  contentX: number;
  contentW: number;
  rowH: number;
  datePillH: number;
  sectionGap: number;
  headerBottom: number;
  footerH: number;
  timeFontPx: number;
  titleFontPx: number;
};

function countRows(sections: ItineraryWallpaperSection[]): number {
  return sections.reduce((n, sec) => n + sec.rows.length, 0);
}

/** Shared metrics so export height and paint use the same responsive compression. */
export function computeWallpaperLayout(
  width: number,
  height: number,
  sections: ItineraryWallpaperSection[],
  eventMeta?: string,
  scaleFactor?: number,
): WallpaperLayout {
  const s = scale(width, scaleFactor);
  const pad = 36 * s;
  const timelineCol = 28 * s;
  const timelineX = pad + timelineCol / 2;
  const contentX = pad + timelineCol + 10 * s;
  const contentW = width - contentX - pad;

  const hasMeta = Boolean(eventMeta?.trim());
  const titleBlock = 38 * s + (hasMeta ? 22 * s : 0) + 18 * s;
  const headerBottom = 56 * s + titleBlock;
  const footerH = 76 * s;
  const datePillH = 34 * s;
  const sectionGap = 10 * s;
  const sectionCount = sections.length;
  const totalRows = countRows(sections);

  const fixedChrome =
    headerBottom +
    footerH +
    sectionCount * (datePillH + sectionGap) +
    Math.max(0, sectionCount - 1) * 6 * s;

  const available = Math.max(120 * s, height - fixedChrome);
  const rowGap = 8 * s;
  const rowH =
    totalRows > 0
      ? Math.max(64 * s, Math.min(96 * s, (available - totalRows * rowGap) / totalRows))
      : 80 * s;

  const timeFontPx = Math.round(Math.min(28 * s, rowH * 0.34));
  const titleFontPx = Math.round(Math.min(22 * s, rowH * 0.26));

  return {
    s,
    pad,
    timelineX,
    contentX,
    contentW,
    rowH,
    datePillH,
    sectionGap,
    headerBottom,
    footerH,
    timeFontPx,
    titleFontPx,
  };
}

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

function drawBackground(ctx: CanvasRenderingContext2D, w: number, h: number) {
  const gradient = ctx.createLinearGradient(0, 0, 0, h);
  gradient.addColorStop(0, WALLPAPER_THEME.bgTop);
  gradient.addColorStop(0.55, "#0a060c");
  gradient.addColorStop(1, WALLPAPER_THEME.bgBottom);
  ctx.fillStyle = gradient;
  ctx.fillRect(0, 0, w, h);

  const glow = ctx.createRadialGradient(w * 0.5, h * 0.08, 0, w * 0.5, h * 0.08, w * 0.65);
  glow.addColorStop(0, WALLPAPER_THEME.glowPink);
  glow.addColorStop(1, "rgba(255, 0, 102, 0)");
  ctx.fillStyle = glow;
  ctx.fillRect(0, 0, w, h);

  const glowPurple = ctx.createRadialGradient(w * 0.85, h * 0.55, 0, w * 0.85, h * 0.55, w * 0.5);
  glowPurple.addColorStop(0, WALLPAPER_THEME.glowPurple);
  glowPurple.addColorStop(1, "rgba(123, 97, 255, 0)");
  ctx.fillStyle = glowPurple;
  ctx.fillRect(0, 0, w, h);
}

function drawPageHeader(
  ctx: CanvasRenderingContext2D,
  pad: number,
  w: number,
  yStart: number,
  s: number,
  eventMeta?: string,
): number {
  let y = yStart;

  ctx.textAlign = "left";
  ctx.textBaseline = "top";
  ctx.fillStyle = WALLPAPER_THEME.textPrimary;
  ctx.font = `700 ${Math.round(28 * s)}px sans-serif`;
  ctx.fillText("我的专属行程", pad, y);
  y += 36 * s;

  const meta = eventMeta?.trim();
  if (meta) {
    ctx.fillStyle = WALLPAPER_THEME.textSecondary;
    ctx.font = `500 ${Math.round(18 * s)}px sans-serif`;
    ctx.fillText(meta, pad, y);
    y += 22 * s;
  }

  const lineY = y + 6 * s;
  const lineGrad = ctx.createLinearGradient(pad, lineY, w - pad, lineY);
  lineGrad.addColorStop(0, "rgba(255, 0, 102, 0.7)");
  lineGrad.addColorStop(0.5, "rgba(255, 0, 102, 0.35)");
  lineGrad.addColorStop(1, "rgba(123, 97, 255, 0.25)");
  ctx.strokeStyle = lineGrad;
  ctx.lineWidth = Math.max(1, 1.5 * s);
  ctx.beginPath();
  ctx.moveTo(pad, lineY);
  ctx.lineTo(w - pad, lineY);
  ctx.stroke();

  return lineY + 18 * s;
}

function drawDatePill(
  ctx: CanvasRenderingContext2D,
  layout: WallpaperLayout,
  y: number,
  dateLabel: string,
  sectionIndex: number,
): number {
  const style = sectionStyleForIndex(sectionIndex);
  const { contentX, contentW, datePillH, s } = layout;
  const pillW = Math.min(contentW, 132 * s);
  const pillH = datePillH;
  const r = pillH / 2;

  ctx.fillStyle = style.pillBg;
  roundRect(ctx, contentX, y, pillW, pillH, r);
  ctx.fill();
  ctx.strokeStyle = style.pillBorder;
  ctx.lineWidth = Math.max(1, 1.5 * s);
  roundRect(ctx, contentX, y, pillW, pillH, r);
  ctx.stroke();

  const dotR = 4 * s;
  const dotCx = contentX + 14 * s;
  const dotCy = y + pillH / 2;
  ctx.fillStyle = style.dot;
  ctx.beginPath();
  ctx.arc(dotCx, dotCy, dotR, 0, Math.PI * 2);
  ctx.fill();

  ctx.textAlign = "left";
  ctx.textBaseline = "middle";
  ctx.fillStyle = WALLPAPER_THEME.textPrimary;
  ctx.font = `600 ${Math.round(16 * s)}px sans-serif`;
  ctx.fillText(dateLabel, contentX + 26 * s, dotCy);

  return y + pillH + layout.sectionGap;
}

function drawTimelineRail(
  ctx: CanvasRenderingContext2D,
  layout: WallpaperLayout,
  yStart: number,
  yEnd: number,
  sectionIndex: number,
) {
  const style = sectionStyleForIndex(sectionIndex);
  ctx.strokeStyle = style.rail;
  ctx.lineWidth = Math.max(1.5, 2 * layout.s);
  ctx.globalAlpha = 0.85;
  ctx.beginPath();
  ctx.moveTo(layout.timelineX, yStart);
  ctx.lineTo(layout.timelineX, yEnd);
  ctx.stroke();
  ctx.globalAlpha = 1;
}

function drawTimelineDot(
  ctx: CanvasRenderingContext2D,
  layout: WallpaperLayout,
  cy: number,
  row: ItineraryWallpaperRow,
  sectionIndex: number,
) {
  const sectionDot = sectionStyleForIndex(sectionIndex).dot;
  const accent = WALLPAPER_ACCENT[row.dotColor];
  const r = 5 * layout.s;

  ctx.fillStyle = sectionDot;
  ctx.beginPath();
  ctx.arc(layout.timelineX, cy, r + 2 * layout.s, 0, Math.PI * 2);
  ctx.fill();

  ctx.fillStyle = accent.dot;
  ctx.beginPath();
  ctx.arc(layout.timelineX, cy, r, 0, Math.PI * 2);
  ctx.fill();
}

function drawEventCard(
  ctx: CanvasRenderingContext2D,
  row: ItineraryWallpaperRow,
  layout: WallpaperLayout,
  y: number,
): number {
  const { contentX, contentW, rowH, s, timeFontPx, titleFontPx } = layout;
  const cardR = 12 * s;
  const innerPadX = 14 * s;
  const innerPadY = 10 * s;

  ctx.fillStyle = WALLPAPER_THEME.cardBg;
  roundRect(ctx, contentX, y, contentW, rowH, cardR);
  ctx.fill();
  ctx.strokeStyle = WALLPAPER_THEME.cardBorder;
  ctx.lineWidth = 1;
  roundRect(ctx, contentX, y, contentW, rowH, cardR);
  ctx.stroke();

  const timeColor = WALLPAPER_THEME.timePink;

  ctx.textAlign = "left";
  ctx.textBaseline = "top";
  ctx.fillStyle = timeColor;
  ctx.font = `700 ${timeFontPx}px "SF Mono", "Menlo", monospace`;
  ctx.fillText(row.time, contentX + innerPadX, y + innerPadY);

  const stageLine = row.stage ? `${row.artist} · ${row.stage}` : row.artist;
  const displayLine = stageLine.length > 28 ? `${stageLine.slice(0, 27)}…` : stageLine;

  ctx.fillStyle = WALLPAPER_THEME.textPrimary;
  ctx.font = `600 ${titleFontPx}px sans-serif`;
  ctx.fillText(
    displayLine,
    contentX + innerPadX,
    y + innerPadY + timeFontPx + 6 * s,
    contentW - innerPadX * 2,
  );

  return y + rowH + 8 * layout.s;
}

function drawFooter(ctx: CanvasRenderingContext2D, w: number, h: number, pad: number, s: number) {
  ctx.textAlign = "center";
  ctx.textBaseline = "bottom";
  ctx.fillStyle = WALLPAPER_THEME.brand;
  ctx.font = `800 ${Math.round(22 * s)}px sans-serif`;
  ctx.fillText("SYNC", w / 2, h - pad);
  ctx.fillStyle = WALLPAPER_THEME.textMuted;
  ctx.font = `500 ${Math.round(14 * s)}px sans-serif`;
  ctx.fillText("专属行程屏保", w / 2, h - pad - 26 * s);
}

/** Estimate canvas height from section row counts (logical px at export width). */
export function estimateWallpaperContentHeight(
  sections: ItineraryWallpaperSection[],
  width: number,
  scaleFactor?: number,
  eventMeta?: string,
): number {
  const s = scale(width, scaleFactor);
  const probeHeight = 2400 * s;
  const layout = computeWallpaperLayout(width, probeHeight, sections, eventMeta, scaleFactor);
  const totalRows = countRows(sections);
  const rowsBlock =
    totalRows * (layout.rowH + 8 * s) + sections.length * (layout.datePillH + layout.sectionGap);
  return Math.ceil(layout.headerBottom + rowsBlock + layout.footerH + layout.pad);
}

/** Paint lock-screen style itinerary wallpaper onto a 2d context. */
export function drawItineraryWallpaper(
  ctx: CanvasRenderingContext2D,
  params: ItineraryWallpaperDrawParams,
): void {
  const { width: w, height: h, sections, eventMeta } = params;
  const layout = computeWallpaperLayout(w, h, sections, eventMeta, params.scaleFactor);

  ctx.clearRect(0, 0, w, h);
  drawBackground(ctx, w, h);

  let y = 56 * layout.s;
  y = drawPageHeader(ctx, layout.pad, w, y, layout.s, eventMeta);

  for (let si = 0; si < sections.length; si += 1) {
    const section = sections[si]!;
    y = drawDatePill(ctx, layout, y, section.dateLabel, si);

    const firstRowY = y;
    for (const row of section.rows) {
      const cardCenterY = y + layout.rowH / 2;
      drawTimelineDot(ctx, layout, cardCenterY, row, si);
      y = drawEventCard(ctx, row, layout, y);
    }

    if (section.rows.length > 0) {
      const railEnd = y - 8 * layout.s - layout.rowH / 2;
      drawTimelineRail(ctx, layout, firstRowY + layout.rowH / 2, railEnd, si);
    }

    if (section.truncated && section.hiddenCount > 0) {
      ctx.textAlign = "left";
      ctx.textBaseline = "top";
      ctx.fillStyle = WALLPAPER_THEME.textMuted;
      ctx.font = `500 ${Math.round(14 * layout.s)}px sans-serif`;
      ctx.fillText(`… 还有 ${section.hiddenCount} 场演出`, layout.contentX, y);
      y += 22 * layout.s;
    }

    y += 6 * layout.s;
  }

  drawFooter(ctx, w, h, layout.pad, layout.s);
}
