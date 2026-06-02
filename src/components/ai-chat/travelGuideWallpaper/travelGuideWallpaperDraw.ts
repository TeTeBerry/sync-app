import type { TravelGuidePlan } from '../../../types/travelGuide';
import { createOffscreenCanvas } from '../../../utils/offscreenCanvas';

const W = 750;
const PAD = 40;
const LINE = 36;
const SECTION_GAP = 28;
const HEADER_BLOCK = 72 + 40 * 2;
const META_LINE = 34;
const SECTION_TITLE = 44;
const FOOTER_BLOCK = 56;
/** 微信单张 canvas 建议不超过 4096，留余量 */
export const TRAVEL_GUIDE_MAX_CANVAS_HEIGHT = 4096;
const MAX_CANVAS_HEIGHT = TRAVEL_GUIDE_MAX_CANVAS_HEIGHT;

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
        .map((l) => `· ${l}`),
    },
    {
      title: plan.accommodation.title,
      lines: plan.accommodation.hotels.flatMap((h) => {
        const hint = h.bookingHint ? `（${h.bookingHint}）` : '';
        return [`· ${h.name}：${h.note}${hint}`];
      }),
    },
  ];

  if (plan.parking?.lines.length) {
    sections.push({
      title: plan.parking.title,
      lines: plan.parking.lines
        .map((l) => formatGuideLine(l))
        .filter(Boolean)
        .map((l) => `· ${l}`),
    });
  }

  sections.push({
    title: plan.nightlife.title,
    lines: plan.nightlife.spots.map((s) => `· ${s.name}：${s.note}`),
  });

  sections.push({
    title: plan.tips.title,
    lines: plan.tips.items
      .map((t) => formatGuideLine(t))
      .filter(Boolean)
      .map((t) => `· ${t}`),
  });

  return sections;
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

function conservativeHeightEstimate(plan: TravelGuidePlan): number {
  const sections = buildWallpaperSections(plan);
  let chars = plan.activityName.length + 200;
  for (const s of sections) {
    for (const line of s.lines) {
      chars += line.length;
    }
  }
  const wrappedLines = Math.ceil(chars / 22);
  return Math.min(
    MAX_CANVAS_HEIGHT,
    Math.max(
      1200,
      PAD * 2 +
        HEADER_BLOCK +
        4 * META_LINE +
        wrappedLines * LINE +
        sections.length * (SECTION_TITLE + SECTION_GAP) +
        FOOTER_BLOCK,
    ),
  );
}

function layoutTravelGuideContent(
  ctx: CanvasRenderingContext2D,
  plan: TravelGuidePlan,
): number {
  const maxText = W - PAD * 2;
  let y = PAD + 8;

  y += 72;

  ctx.font = 'bold 32px sans-serif';
  y += wrapText(ctx, plan.activityName, maxText).length * 40;

  ctx.font = '24px sans-serif';
  const meta = [
    `📅 ${plan.eventDates}`,
    `📍 ${plan.venue}`,
    `🚩 ${plan.departure}出发 · ${plan.headcount}人 · 住${plan.accommodationNights}晚`,
    `💰 ${plan.budgetLabel} · ${plan.selfDrive ? '自驾' : '公共交通'}`,
  ];
  y += meta.length * META_LINE;
  y += SECTION_GAP;

  ctx.font = '24px sans-serif';
  for (const section of buildWallpaperSections(plan)) {
    y += SECTION_TITLE;
    for (const raw of section.lines) {
      y += wrapText(ctx, raw, maxText).length * LINE;
    }
    y += SECTION_GAP;
  }

  y += FOOTER_BLOCK;
  return Math.min(MAX_CANVAS_HEIGHT, Math.max(1200, y + PAD));
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
  bg.addColorStop(0, '#1a1033');
  bg.addColorStop(0.45, '#12082a');
  bg.addColorStop(1, '#0a0618');
  ctx.fillStyle = bg;
  ctx.fillRect(0, 0, W, height);

  let y = PAD + 8;

  ctx.fillStyle = '#f472b6';
  ctx.font = 'bold 40px sans-serif';
  ctx.fillText('AI 出行攻略', PAD, y + 40);
  y += 72;

  ctx.fillStyle = '#ffffff';
  ctx.font = 'bold 32px sans-serif';
  for (const line of wrapText(ctx, plan.activityName, maxText)) {
    ctx.fillText(line, PAD, y + 28);
    y += 40;
  }

  ctx.fillStyle = 'rgba(255,255,255,0.75)';
  ctx.font = '24px sans-serif';
  const driveLabel = plan.selfDrive ? '自驾' : '公共交通';
  const meta = [
    `📅 ${plan.eventDates}`,
    `📍 ${plan.venue}`,
    `🚩 ${plan.departure}出发 · ${plan.headcount}人 · 住${plan.accommodationNights}晚`,
    `💰 ${plan.budgetLabel} · ${driveLabel}`,
  ];
  for (const line of meta) {
    ctx.fillText(line, PAD, y + 24);
    y += META_LINE;
  }
  y += SECTION_GAP;

  const drawSection = (title: string, bodyLines: string[]) => {
    ctx.fillStyle = '#c084fc';
    ctx.font = 'bold 28px sans-serif';
    ctx.fillText(title, PAD, y + 26);
    y += SECTION_TITLE;
    ctx.fillStyle = 'rgba(255,255,255,0.9)';
    ctx.font = '24px sans-serif';
    for (const raw of bodyLines) {
      for (const line of wrapText(ctx, raw, maxText)) {
        ctx.fillText(line, PAD + 8, y + 22);
        y += LINE;
      }
    }
    y += SECTION_GAP;
  };

  for (const section of buildWallpaperSections(plan)) {
    drawSection(section.title, section.lines);
  }

  y += 12;
  ctx.fillStyle = 'rgba(255,255,255,0.45)';
  ctx.font = '20px sans-serif';
  ctx.textAlign = 'center';
  ctx.fillText('Sync · AI 攻略', W / 2, y + 20);
  ctx.textAlign = 'left';
}

export { W as TRAVEL_GUIDE_CANVAS_WIDTH };
