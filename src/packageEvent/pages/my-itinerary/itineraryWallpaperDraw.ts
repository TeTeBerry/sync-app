import type { ItineraryWallpaperSection } from './itineraryWallpaperParse';
import type { ItineraryWallpaperRow } from './itineraryWallpaperParse';
import { lockScreenInsets, WALLPAPER_DESIGN } from './itineraryWallpaperDesign';
import { WALLPAPER_THEME } from './itineraryWallpaperTheme';

export type ItineraryWallpaperDrawParams = {
  width: number;
  height: number;
  sections: ItineraryWallpaperSection[];
  eventMeta?: string;
  /** Device scale for fonts/spacing; defaults to width / 390. */
  scaleFactor?: number;
};

const MAX_ROW_H = 88;
const MIN_ROW_H = 46;
const ABSOLUTE_MIN_ROW_H = 18;

function scale(width: number, scaleFactor?: number): number {
  return scaleFactor ?? width / WALLPAPER_DESIGN.width;
}

type DensityTier = {
  headerCompact: boolean;
  showEventMeta: boolean;
  showFooterTagline: boolean;
  datePillH: number;
  rowGap: number;
  sectionGap: number;
  interSectionGap: number;
};

export type WallpaperLayout = {
  s: number;
  pad: number;
  timelineX: number;
  contentX: number;
  contentW: number;
  rowH: number;
  rowGap: number;
  datePillH: number;
  sectionGap: number;
  interSectionGap: number;
  clockZoneH: number;
  bottomSafeH: number;
  headerTop: number;
  headerBottom: number;
  contentBottom: number;
  footerBaseY: number;
  timeFontPx: number;
  titleFontPx: number;
  compact: boolean;
  ultraCompact: boolean;
  showEventMeta: boolean;
  showFooterTagline: boolean;
};

function countRows(sections: ItineraryWallpaperSection[]): number {
  return sections.reduce((n, sec) => n + sec.rows.length, 0);
}

function densityTiers(s: number): DensityTier[] {
  return [
    {
      headerCompact: false,
      showEventMeta: true,
      showFooterTagline: true,
      datePillH: 32,
      rowGap: 10,
      sectionGap: 10,
      interSectionGap: 6,
    },
    {
      headerCompact: true,
      showEventMeta: true,
      showFooterTagline: true,
      datePillH: 28,
      rowGap: 6,
      sectionGap: 6,
      interSectionGap: 4,
    },
    {
      headerCompact: true,
      showEventMeta: true,
      showFooterTagline: false,
      datePillH: 24,
      rowGap: 4,
      sectionGap: 4,
      interSectionGap: 3,
    },
    {
      headerCompact: true,
      showEventMeta: true,
      showFooterTagline: false,
      datePillH: 22,
      rowGap: 3,
      sectionGap: 3,
      interSectionGap: 2,
    },
    {
      headerCompact: true,
      showEventMeta: true,
      showFooterTagline: false,
      datePillH: 18,
      rowGap: 2,
      sectionGap: 2,
      interSectionGap: 2,
    },
  ].map((tier) => ({
    ...tier,
    datePillH: tier.datePillH * s,
    rowGap: tier.rowGap * s,
    sectionGap: tier.sectionGap * s,
    interSectionGap: tier.interSectionGap * s,
  }));
}

function parseEventMetaForHeader(meta?: string): {
  festivalName: string;
  location: string;
} {
  const trimmed = meta?.trim() ?? '';
  if (!trimmed) {
    return { festivalName: '', location: '' };
  }
  const stationMatch = trimmed.match(/^(.+?)\s+(\S+站)$/u);
  if (stationMatch) {
    return { festivalName: stationMatch[1]!.trim(), location: stationMatch[2]!.trim() };
  }
  const cityMatch = trimmed.match(/^(.+?)\s+(\S+[市区县])$/u);
  if (cityMatch) {
    return { festivalName: cityMatch[1]!.trim(), location: cityMatch[2]!.trim() };
  }
  return { festivalName: trimmed, location: '' };
}

function headerBlockHeight(s: number, tier: DensityTier, eventMeta?: string): number {
  const { festivalName, location } = parseEventMetaForHeader(eventMeta);
  const titleH = tier.headerCompact ? 30 * s : 36 * s;
  const festivalH =
    tier.showEventMeta && festivalName ? (tier.headerCompact ? 18 * s : 22 * s) : 0;
  const locationH =
    tier.showEventMeta && location ? (tier.headerCompact ? 16 * s : 20 * s) : 0;
  const dividerBlock = tier.headerCompact ? 18 * s : 24 * s;
  return titleH + festivalH + locationH + dividerBlock;
}

function itineraryChromeHeight(
  sections: ItineraryWallpaperSection[],
  tier: DensityTier,
): number {
  const sectionCount = sections.length;
  return (
    sectionCount * (tier.datePillH + tier.sectionGap) +
    Math.max(0, sectionCount - 1) * tier.interSectionGap
  );
}

function fontsForRowHeight(rowH: number, s: number, compact: boolean) {
  const timeFontPx = compact
    ? Math.round(Math.max(14 * s, Math.min(20 * s, rowH * 0.42)))
    : Math.round(Math.max(18 * s, Math.min(28 * s, rowH * 0.36)));
  const titleFontPx = compact
    ? Math.round(Math.max(14 * s, Math.min(18 * s, rowH * 0.4)))
    : Math.round(Math.max(16 * s, Math.min(22 * s, rowH * 0.42)));
  return { timeFontPx, titleFontPx };
}

function layoutRowsInZone(
  sections: ItineraryWallpaperSection[],
  tiers: DensityTier[],
  headerBottom: number,
  contentBottom: number,
  s: number,
  totalRows: number,
): {
  chosen: DensityTier;
  rowH: number;
  rowGap: number;
  headerBottom: number;
} {
  let chosen = tiers[0]!;
  let rowH = MAX_ROW_H * s;
  let rowGap = chosen.rowGap;
  const resolvedHeaderBottom = headerBottom;

  for (const tier of tiers) {
    chosen = tier;
    const zoneH = Math.max(40 * s, contentBottom - resolvedHeaderBottom);
    const chrome = itineraryChromeHeight(sections, tier);

    if (totalRows === 0) {
      rowH = MAX_ROW_H * s;
      rowGap = tier.rowGap;
      break;
    }

    const available = zoneH - chrome;
    const candidate = (available - totalRows * tier.rowGap) / totalRows;
    rowH = Math.max(ABSOLUTE_MIN_ROW_H * s, Math.min(MAX_ROW_H * s, candidate));
    rowGap = tier.rowGap;

    const used = chrome + totalRows * rowH + totalRows * rowGap;
    const slack = zoneH - used;
    if (slack > 0 && totalRows > 0) {
      rowGap += slack / totalRows;
    }

    if (candidate >= MIN_ROW_H * s) {
      break;
    }
  }

  return { chosen, rowH, rowGap, headerBottom: resolvedHeaderBottom };
}

/**
 * Design-spec regions: clock band → header → content band → footer above bottom safe.
 */
export function computeWallpaperLayout(
  width: number,
  height: number,
  sections: ItineraryWallpaperSection[],
  eventMeta?: string,
  scaleFactor?: number,
): WallpaperLayout {
  const s = scale(width, scaleFactor);
  const pad = 36 * s;
  const {
    clockZoneH,
    bottomSafeH,
    headerTop,
    designContentBottom,
    maxContentBottom,
    footerBaseY,
  } = lockScreenInsets(height, s);

  const timelineCol = 28 * s;
  const timelineX = pad + timelineCol / 2;
  const contentX = pad + timelineCol + 10 * s;
  const contentW = width - contentX - pad;

  const totalRows = countRows(sections);
  const tiers = densityTiers(s);
  let chosen = tiers[0]!;
  let rowH = MAX_ROW_H * s;
  let rowGap = chosen.rowGap;
  let headerBottom = headerTop + headerBlockHeight(s, chosen, eventMeta);
  let contentBottom = designContentBottom;

  for (const tier of tiers) {
    chosen = tier;
    headerBottom = headerTop + headerBlockHeight(s, tier, eventMeta);
    const pass = layoutRowsInZone(
      sections,
      [tier],
      headerBottom,
      contentBottom,
      s,
      totalRows,
    );
    rowH = pass.rowH;
    rowGap = pass.rowGap;

    const zoneH = Math.max(40 * s, contentBottom - headerBottom);
    const chrome = itineraryChromeHeight(sections, tier);
    const candidate =
      totalRows > 0
        ? (zoneH - chrome - totalRows * tier.rowGap) / totalRows
        : MAX_ROW_H;

    if (totalRows === 0 || candidate >= MIN_ROW_H * s) {
      break;
    }
  }

  const projectedBottom =
    headerBottom +
    itineraryChromeHeight(sections, chosen) +
    totalRows * (rowH + rowGap);
  if (projectedBottom > contentBottom && projectedBottom <= maxContentBottom) {
    contentBottom = Math.min(maxContentBottom, projectedBottom);
    const pass = layoutRowsInZone(
      sections,
      tiers,
      headerBottom,
      contentBottom,
      s,
      totalRows,
    );
    chosen = pass.chosen;
    rowH = pass.rowH;
    rowGap = pass.rowGap;
  }

  const compact = rowH < 64 * s;
  const ultraCompact = rowH < 44 * s;
  const fonts = fontsForRowHeight(rowH, s, compact);

  return {
    s,
    pad,
    timelineX,
    contentX,
    contentW,
    rowH,
    rowGap,
    datePillH: chosen.datePillH,
    sectionGap: chosen.sectionGap,
    interSectionGap: chosen.interSectionGap,
    clockZoneH,
    bottomSafeH,
    headerTop,
    headerBottom,
    contentBottom,
    footerBaseY,
    compact,
    ultraCompact,
    showEventMeta: chosen.showEventMeta,
    showFooterTagline: chosen.showFooterTagline,
    ...fonts,
  };
}

/** Bottom Y of itinerary content (for fitting checks). */
export function estimateWallpaperContentBottom(
  width: number,
  height: number,
  sections: ItineraryWallpaperSection[],
  eventMeta?: string,
  scaleFactor?: number,
): number {
  const layout = computeWallpaperLayout(
    width,
    height,
    sections,
    eventMeta,
    scaleFactor,
  );
  const totalRows = countRows(sections);
  const rowsBlock =
    totalRows * (layout.rowH + layout.rowGap) +
    sections.length * (layout.datePillH + layout.sectionGap) +
    Math.max(0, sections.length - 1) * layout.interSectionGap;
  return layout.headerBottom + rowsBlock;
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
  gradient.addColorStop(0.45, '#0a060c');
  gradient.addColorStop(0.72, WALLPAPER_THEME.bgBottom);
  gradient.addColorStop(1, '#050208');
  ctx.fillStyle = gradient;
  ctx.fillRect(0, 0, w, h);

  const glow = ctx.createRadialGradient(
    w * 0.5,
    h * 0.14,
    0,
    w * 0.5,
    h * 0.14,
    w * 0.55,
  );
  glow.addColorStop(0, WALLPAPER_THEME.glowPink);
  glow.addColorStop(1, 'rgba(255, 0, 127, 0)');
  ctx.fillStyle = glow;
  ctx.fillRect(0, 0, w, h);

  const glowPurple = ctx.createRadialGradient(
    w * 0.5,
    h * 0.48,
    0,
    w * 0.5,
    h * 0.48,
    w * 0.55,
  );
  glowPurple.addColorStop(0, WALLPAPER_THEME.glowPurple);
  glowPurple.addColorStop(1, 'rgba(123, 97, 255, 0)');
  ctx.fillStyle = glowPurple;
  ctx.fillRect(0, 0, w, h);
}

function drawPageHeader(
  ctx: CanvasRenderingContext2D,
  layout: WallpaperLayout,
  w: number,
  eventMeta?: string,
): void {
  const { s, headerTop, compact } = layout;
  const cx = w / 2;
  let y = headerTop;
  const titleSize = Math.round(compact ? 24 * s : 28 * s);
  const { festivalName, location } = parseEventMetaForHeader(eventMeta);

  ctx.textAlign = 'center';
  ctx.textBaseline = 'top';
  ctx.fillStyle = WALLPAPER_THEME.textPrimary;
  ctx.font = `700 ${titleSize}px sans-serif`;
  ctx.fillText('我的专属行程', cx, y);
  y += compact ? 30 * s : 36 * s;

  if (layout.showEventMeta && festivalName) {
    ctx.fillStyle = WALLPAPER_THEME.textSecondary;
    ctx.font = `500 ${Math.round(compact ? 16 * s : 18 * s)}px sans-serif`;
    ctx.fillText(festivalName, cx, y);
    y += compact ? 18 * s : 22 * s;
  }

  if (layout.showEventMeta && location) {
    ctx.fillStyle = WALLPAPER_THEME.textSecondary;
    ctx.font = `500 ${Math.round(compact ? 15 * s : 17 * s)}px sans-serif`;
    ctx.fillText(location, cx, y);
    y += compact ? 16 * s : 20 * s;
  }

  const lineY = y + (compact ? 4 * s : 6 * s);
  const lineW = Math.min(w * 0.32, compact ? 96 * s : 120 * s);
  const lineGrad = ctx.createLinearGradient(
    cx - lineW / 2,
    lineY,
    cx + lineW / 2,
    lineY,
  );
  lineGrad.addColorStop(0, 'rgba(255, 0, 127, 0.15)');
  lineGrad.addColorStop(0.5, 'rgba(255, 0, 127, 0.85)');
  lineGrad.addColorStop(1, 'rgba(255, 0, 127, 0.15)');
  ctx.strokeStyle = lineGrad;
  ctx.lineWidth = Math.max(1, (compact ? 1.5 : 2) * s);
  if (!layout.ultraCompact) {
    ctx.shadowColor = 'rgba(255, 0, 127, 0.6)';
    ctx.shadowBlur = 6 * s;
  }
  ctx.beginPath();
  ctx.moveTo(cx - lineW / 2, lineY);
  ctx.lineTo(cx + lineW / 2, lineY);
  ctx.stroke();
  ctx.shadowBlur = 0;
}

function drawDateLabel(
  ctx: CanvasRenderingContext2D,
  layout: WallpaperLayout,
  y: number,
  dateLabel: string,
): number {
  const { contentX, timeFontPx, s } = layout;

  ctx.textAlign = 'left';
  ctx.textBaseline = 'top';
  ctx.fillStyle = WALLPAPER_THEME.textPrimary;
  ctx.font = `600 ${timeFontPx}px sans-serif`;
  ctx.fillText(dateLabel, contentX, y);

  return y + timeFontPx + 6 * s + layout.sectionGap;
}

function drawTimelineRail(
  ctx: CanvasRenderingContext2D,
  layout: WallpaperLayout,
  yStart: number,
  yEnd: number,
) {
  if (yEnd <= yStart) {
    return;
  }

  ctx.save();
  if (!layout.ultraCompact) {
    ctx.strokeStyle = 'rgba(255, 0, 127, 0.25)';
    ctx.lineWidth = Math.max(4, 6 * layout.s);
    ctx.globalAlpha = 0.5;
    ctx.beginPath();
    ctx.moveTo(layout.timelineX, yStart);
    ctx.lineTo(layout.timelineX, yEnd);
    ctx.stroke();
  }

  ctx.strokeStyle = WALLPAPER_THEME.railPink;
  ctx.lineWidth = Math.max(1.5, 2 * layout.s);
  ctx.globalAlpha = layout.ultraCompact ? 0.75 : 0.9;
  if (!layout.ultraCompact) {
    ctx.shadowColor = 'rgba(255, 0, 127, 0.65)';
    ctx.shadowBlur = 8 * layout.s;
  }
  ctx.beginPath();
  ctx.moveTo(layout.timelineX, yStart);
  ctx.lineTo(layout.timelineX, yEnd);
  ctx.stroke();
  ctx.restore();
}

function drawTimelineDot(
  ctx: CanvasRenderingContext2D,
  layout: WallpaperLayout,
  cy: number,
) {
  const r = (layout.ultraCompact ? 3.5 : 5) * layout.s;

  ctx.save();
  if (!layout.ultraCompact) {
    ctx.shadowColor = 'rgba(255, 0, 127, 0.75)';
    ctx.shadowBlur = 10 * layout.s;
    ctx.fillStyle = 'rgba(255, 0, 127, 0.35)';
    ctx.beginPath();
    ctx.arc(layout.timelineX, cy, r + 3 * layout.s, 0, Math.PI * 2);
    ctx.fill();
  }

  ctx.fillStyle = WALLPAPER_THEME.dotPink;
  ctx.beginPath();
  ctx.arc(layout.timelineX, cy, r, 0, Math.PI * 2);
  ctx.fill();
  ctx.restore();
}

function formatArtistStageLine(row: ItineraryWallpaperRow, maxLen: number): string {
  const stage = row.stage.trim();
  const line = stage ? `${row.artist} • ${stage}` : row.artist;
  return line.length > maxLen ? `${line.slice(0, maxLen - 1)}…` : line;
}

function drawEventCard(
  ctx: CanvasRenderingContext2D,
  row: ItineraryWallpaperRow,
  layout: WallpaperLayout,
  y: number,
): number {
  const {
    contentX,
    contentW,
    rowH,
    s,
    timeFontPx,
    titleFontPx,
    compact,
    ultraCompact,
  } = layout;
  const cardR = ultraCompact ? 8 * s : compact ? 10 * s : 12 * s;
  const innerPadX = ultraCompact ? 10 * s : 14 * s;

  ctx.fillStyle = WALLPAPER_THEME.cardBg;
  roundRect(ctx, contentX, y, contentW, rowH, cardR);
  ctx.fill();
  ctx.strokeStyle = WALLPAPER_THEME.cardBorder;
  ctx.lineWidth = Math.max(1, 1 * s);
  roundRect(ctx, contentX, y, contentW, rowH, cardR);
  ctx.stroke();

  const glow = !ultraCompact;
  const maxArtistLen = compact ? 36 : 32;

  if (compact) {
    const timeColW = 68 * s;
    const textY = y + (rowH - Math.max(timeFontPx, titleFontPx)) / 2;

    ctx.textAlign = 'left';
    ctx.textBaseline = 'top';
    ctx.fillStyle = WALLPAPER_THEME.timePink;
    ctx.font = `700 ${timeFontPx}px "SF Mono", "Menlo", monospace`;
    if (glow) {
      ctx.shadowColor = 'rgba(255, 0, 127, 0.55)';
      ctx.shadowBlur = 6 * s;
    }
    ctx.fillText(row.time, contentX + innerPadX, textY);
    ctx.shadowBlur = 0;

    ctx.fillStyle = WALLPAPER_THEME.textPrimary;
    ctx.font = `700 ${titleFontPx}px sans-serif`;
    ctx.fillText(
      formatArtistStageLine(row, maxArtistLen),
      contentX + innerPadX + timeColW,
      textY,
      contentW - innerPadX * 2 - timeColW,
    );
  } else {
    const innerPadY = 12 * s;

    ctx.textAlign = 'left';
    ctx.textBaseline = 'top';
    ctx.fillStyle = WALLPAPER_THEME.timePink;
    ctx.font = `700 ${timeFontPx}px "SF Mono", "Menlo", monospace`;
    if (glow) {
      ctx.shadowColor = 'rgba(255, 0, 127, 0.55)';
      ctx.shadowBlur = 8 * s;
    }
    ctx.fillText(row.time, contentX + innerPadX, y + innerPadY);
    ctx.shadowBlur = 0;

    ctx.fillStyle = WALLPAPER_THEME.textPrimary;
    ctx.font = `700 ${titleFontPx}px sans-serif`;
    ctx.fillText(
      formatArtistStageLine(row, maxArtistLen),
      contentX + innerPadX,
      y + innerPadY + timeFontPx + 8 * s,
      contentW - innerPadX * 2,
    );
  }

  return y + rowH + layout.rowGap;
}

function drawFooter(ctx: CanvasRenderingContext2D, w: number, layout: WallpaperLayout) {
  const { s, showFooterTagline, ultraCompact, footerBaseY } = layout;
  const brandSize = Math.round(ultraCompact ? 18 * s : 22 * s);

  ctx.textAlign = 'center';
  ctx.textBaseline = 'bottom';
  ctx.fillStyle = WALLPAPER_THEME.brand;
  ctx.font = `800 ${brandSize}px sans-serif`;
  ctx.fillText('SYNC', w / 2, footerBaseY);

  if (showFooterTagline) {
    ctx.fillStyle = WALLPAPER_THEME.textMuted;
    ctx.font = `500 ${Math.round(14 * s)}px sans-serif`;
    ctx.fillText('专属行程屏保', w / 2, footerBaseY - 26 * s);
  }
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

  drawPageHeader(ctx, layout, w, eventMeta);

  let y = layout.headerBottom;

  let timelineStart: number | null = null;
  let timelineEnd = 0;

  for (const section of sections) {
    y = drawDateLabel(ctx, layout, y, section.dateLabel);

    for (const row of section.rows) {
      const cardCenterY = y + layout.rowH / 2;
      if (timelineStart == null) {
        timelineStart = cardCenterY;
      }
      drawTimelineDot(ctx, layout, cardCenterY);
      timelineEnd = cardCenterY;
      y = drawEventCard(ctx, row, layout, y);
    }

    y += layout.interSectionGap;
  }

  if (timelineStart != null) {
    drawTimelineRail(ctx, layout, timelineStart, timelineEnd);
  }

  drawFooter(ctx, w, layout);
}
