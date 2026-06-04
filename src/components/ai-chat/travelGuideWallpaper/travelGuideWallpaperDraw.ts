import { AI_TRAVEL_GUIDE_DISCLAIMER } from '../../../constants/aiDisclosure';
import type { TravelGuidePlan } from '../../../types/travelGuide';
import { createOffscreenCanvas } from '../../../utils/offscreenCanvas';
import { TRAVEL_GUIDE_WALLPAPER_THEME as T } from './travelGuideWallpaperTheme';

const W = 750;
const PAD = 48;
const BODY_FONT = '22px sans-serif';
const BODY_LINE = 44;
const BODY_INDENT = 18;
const SECTION_GAP = 48;
const SECTION_TITLE = 56;
const META_FONT = '24px sans-serif';
const META_LINE = 42;
const TITLE_FONT = 'bold 32px sans-serif';
const TITLE_LINE = 46;
const HEADER_FONT = 'bold 40px sans-serif';
const HEADER_BLOCK = 52;
const FOOTER_BLOCK = 100;
const ITEM_GAP = 14;
const MAX_BULLET_CHARS = 88;

/** 微信单张 canvas 建议不超过 4096，留余量 */
export const TRAVEL_GUIDE_MAX_CANVAS_HEIGHT = 4096;
const MAX_CANVAS_HEIGHT = TRAVEL_GUIDE_MAX_CANVAS_HEIGHT;

const SECTION_LIMITS = {
  transportLines: 3,
  hotels: 3,
  nightlifeSpots: 4,
  tips: 4,
} as const;

type GuideCanvas = {
  width: number;
  height: number;
  getContext(contextId: '2d'): CanvasRenderingContext2D | null;
};

function wrapText(
  ctx: CanvasRenderingContext2D,
  text: string,
  maxWidth: number,
): string[] {
  const lines: string[] = [];
  let line = '';
  for (const char of text) {
    const next = line + char;
    if (ctx.measureText(next).width > maxWidth && line) {
      lines.push(line);
      line = char;
    } else {
      line = next;
    }
  }
  if (line) lines.push(line);
  return lines.length ? lines : [''];
}

function truncateWallpaperText(text: string, max = MAX_BULLET_CHARS): string {
  const trimmed = text.trim();
  if (trimmed.length <= max) return trimmed;
  return `${trimmed.slice(0, max - 1)}…`;
}

function formatGuideLine(line: unknown): string {
  if (typeof line === 'string') return line.trim();
  if (line && typeof line === 'object') {
    const record = line as Record<string, unknown>;
    for (const key of ['text', 'content', 'line', 'description']) {
      const part = record[key];
      if (typeof part === 'string' && part.trim()) return part.trim();
    }
  }
  return '';
}

function buildWallpaperSections(
  plan: TravelGuidePlan,
): Array<{ title: string; lines: string[] }> {
  const sections: Array<{ title: string; lines: string[] }> = [
    {
      title: plan.transport.title,
      lines: plan.transport.lines
        .map((l) => formatGuideLine(l))
        .filter(Boolean)
        .slice(0, SECTION_LIMITS.transportLines)
        .map((l) => truncateWallpaperText(`· ${l}`)),
    },
    {
      title: plan.accommodation.title,
      lines: plan.accommodation.hotels.slice(0, SECTION_LIMITS.hotels).flatMap((h) => {
        const hint = h.bookingHint ? `（${h.bookingHint}）` : '';
        return [`· ${h.name}`, `  ${truncateWallpaperText(`${h.note}${hint}`, 72)}`];
      }),
    },
  ];

  if (plan.parking?.lines.length) {
    sections.push({
      title: plan.parking.title,
      lines: plan.parking.lines
        .map((l) => formatGuideLine(l))
        .filter(Boolean)
        .slice(0, 2)
        .map((l) => truncateWallpaperText(`· ${l}`)),
    });
  }

  sections.push({
    title: plan.nightlife.title,
    lines: plan.nightlife.spots
      .slice(0, SECTION_LIMITS.nightlifeSpots)
      .flatMap((s) => [`· ${s.name}`, `  ${truncateWallpaperText(s.note, 72)}`]),
  });

  sections.push({
    title: plan.tips.title,
    lines: plan.tips.items
      .map((t) => formatGuideLine(t))
      .filter(Boolean)
      .slice(0, SECTION_LIMITS.tips)
      .map((t) => truncateWallpaperText(`· ${t}`)),
  });

  return sections;
}

function measureWrappedLines(
  ctx: CanvasRenderingContext2D,
  lines: string[],
  maxText: number,
  lineHeight: number,
  indent = 0,
): number {
  let h = 0;
  for (const raw of lines) {
    const xIndent = raw.startsWith('  ') ? BODY_INDENT : 0;
    ctx.font = BODY_FONT;
    for (const line of wrapText(ctx, raw.trim(), maxText - xIndent)) {
      h += lineHeight;
    }
    h += ITEM_GAP;
  }
  return h;
}

function layoutTravelGuideContent(
  ctx: CanvasRenderingContext2D,
  plan: TravelGuidePlan,
): number {
  const maxText = W - PAD * 2;
  let y = PAD;

  y += HEADER_BLOCK + 24;

  ctx.font = TITLE_FONT;
  y += wrapText(ctx, plan.activityName, maxText).length * TITLE_LINE;

  ctx.font = META_FONT;
  const meta = [
    `📅 ${plan.eventDates}`,
    `📍 ${truncateWallpaperText(plan.venue, 40)}`,
    `🚩 ${plan.departure}出发 · ${plan.headcount}人 · 住${plan.accommodationNights}晚`,
    `💰 ${plan.budgetLabel} · ${plan.selfDrive ? '自驾' : '公共交通'}`,
  ];
  y += meta.length * META_LINE;
  y += SECTION_GAP;

  for (const section of buildWallpaperSections(plan)) {
    y += SECTION_TITLE;
    ctx.font = BODY_FONT;
    y += measureWrappedLines(ctx, section.lines, maxText, BODY_LINE);
    y += SECTION_GAP - ITEM_GAP;
  }

  y += FOOTER_BLOCK;
  return Math.min(MAX_CANVAS_HEIGHT, Math.max(1200, y + PAD));
}

function conservativeHeightEstimate(plan: TravelGuidePlan): number {
  const sections = buildWallpaperSections(plan);
  let lines = 0;
  for (const s of sections) {
    lines += s.lines.length;
  }
  return Math.min(
    MAX_CANVAS_HEIGHT,
    Math.max(
      1400,
      PAD * 2 +
        HEADER_BLOCK +
        80 +
        4 * META_LINE +
        sections.length * (SECTION_TITLE + SECTION_GAP) +
        lines * BODY_LINE +
        lines * ITEM_GAP +
        FOOTER_BLOCK,
    ),
  );
}

/**
 * 按与绘制相同的换行规则测量内容高度（避免 estimate 偏小导致导出被裁切）。
 */
export function measureTravelGuideWallpaperHeight(plan: TravelGuidePlan): number {
  const measureCanvas = createOffscreenCanvas(W, 64);
  const ctx = measureCanvas?.getContext('2d');
  if (!ctx) {
    return conservativeHeightEstimate(plan);
  }
  return layoutTravelGuideContent(ctx, plan);
}

function drawBodyLines(
  ctx: CanvasRenderingContext2D,
  bodyLines: string[],
  maxText: number,
  yStart: number,
): number {
  let y = yStart;
  ctx.fillStyle = 'rgba(255, 255, 255, 0.9)';
  ctx.font = BODY_FONT;

  for (const raw of bodyLines) {
    const indent = raw.startsWith('  ') ? BODY_INDENT : 0;
    const text = raw.trim();
    for (const line of wrapText(ctx, text, maxText - indent)) {
      ctx.fillText(line, PAD + indent, y + 20);
      y += BODY_LINE;
    }
    y += ITEM_GAP;
  }
  return y;
}

export function drawTravelGuideWallpaper(
  canvas: GuideCanvas,
  plan: TravelGuidePlan,
): void {
  const height = measureTravelGuideWallpaperHeight(plan);
  canvas.width = W;
  canvas.height = height;
  const ctx = canvas.getContext('2d');
  if (!ctx) throw new Error('canvas 2d unavailable');

  const maxText = W - PAD * 2;

  const bg = ctx.createLinearGradient(0, 0, 0, height);
  bg.addColorStop(0, T.bgTop);
  bg.addColorStop(0.42, T.bgMid);
  bg.addColorStop(1, T.bgBottom);
  ctx.fillStyle = bg;
  ctx.fillRect(0, 0, W, height);

  let y = PAD;

  ctx.fillStyle = T.headerTitle;
  ctx.font = HEADER_FONT;
  ctx.fillText('AI 出行攻略', PAD, y + 40);
  y += HEADER_BLOCK + 24;

  ctx.fillStyle = T.text;
  ctx.font = TITLE_FONT;
  for (const line of wrapText(ctx, plan.activityName, maxText)) {
    ctx.fillText(line, PAD, y + 30);
    y += TITLE_LINE;
  }
  y += 8;

  ctx.fillStyle = T.textMuted;
  ctx.font = META_FONT;
  const driveLabel = plan.selfDrive ? '自驾' : '公共交通';
  const meta = [
    `📅 ${plan.eventDates}`,
    `📍 ${truncateWallpaperText(plan.venue, 40)}`,
    `🚩 ${plan.departure}出发 · ${plan.headcount}人 · 住${plan.accommodationNights}晚`,
    `💰 ${plan.budgetLabel} · ${driveLabel}`,
  ];
  for (const line of meta) {
    ctx.fillText(line, PAD, y + 26);
    y += META_LINE;
  }
  y += SECTION_GAP;

  for (const section of buildWallpaperSections(plan)) {
    ctx.fillStyle = T.sectionTitle;
    ctx.font = 'bold 26px sans-serif';
    ctx.fillText(section.title, PAD, y + 24);
    y += SECTION_TITLE;
    y = drawBodyLines(ctx, section.lines, maxText, y);
    y += SECTION_GAP - ITEM_GAP;
  }

  y += 16;
  ctx.fillStyle = T.textDim;
  ctx.font = '20px sans-serif';
  ctx.textAlign = 'center';
  for (const line of wrapText(ctx, AI_TRAVEL_GUIDE_DISCLAIMER, maxText)) {
    ctx.fillText(line, W / 2, y + 20);
    y += 32;
  }
  y += 12;
  ctx.fillStyle = T.footerBrand;
  ctx.font = 'bold 20px sans-serif';
  ctx.fillText('Sync · AI 攻略', W / 2, y + 20);
  ctx.textAlign = 'left';
}

export { W as TRAVEL_GUIDE_CANVAS_WIDTH };
