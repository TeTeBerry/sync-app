import { describe, expect, it } from 'vitest';
import type { ItineraryTimelineItem } from '@/packageEvent/pages/my-itinerary/myItineraryMock';
import {
  buildWallpaperSectionsByDate,
  type ItineraryWallpaperSection,
} from '@/packageEvent/pages/my-itinerary/itineraryWallpaperParse';
import { MY_ITINERARY_DAYS } from '@/packageEvent/pages/my-itinerary/myItineraryMock';
import {
  lockScreenInsets,
  WALLPAPER_DESIGN,
} from '@/packageEvent/pages/my-itinerary/itineraryWallpaperDesign';
import {
  computeWallpaperLayout,
  drawItineraryWallpaper,
  estimateWallpaperContentBottom,
} from '@/packageEvent/pages/my-itinerary/itineraryWallpaperDraw';

function createMockContext(): CanvasRenderingContext2D {
  const calls: { method: string; args: unknown[] }[] = [];
  const chain = () => mock as CanvasRenderingContext2D;

  const mock = {
    calls,
    clearRect: (...args: unknown[]) => {
      calls.push({ method: 'clearRect', args });
      return chain();
    },
    fillRect: (...args: unknown[]) => {
      calls.push({ method: 'fillRect', args });
      return chain();
    },
    fillText: (...args: unknown[]) => {
      calls.push({ method: 'fillText', args });
      return chain();
    },
    stroke: () => {
      calls.push({ method: 'stroke', args: [] });
      return chain();
    },
    fill: () => chain(),
    beginPath: () => chain(),
    moveTo: () => chain(),
    lineTo: () => chain(),
    arcTo: () => chain(),
    closePath: () => chain(),
    arc: () => chain(),
    createLinearGradient: () => ({
      addColorStop: () => undefined,
    }),
    createRadialGradient: () => ({
      addColorStop: () => undefined,
    }),
    fillStyle: '',
    strokeStyle: '',
    lineWidth: 1,
    font: '',
    textAlign: 'left' as CanvasTextAlign,
    textBaseline: 'top' as CanvasTextBaseline,
    globalAlpha: 1,
    shadowBlur: 0,
    shadowColor: '',
    save: () => chain(),
    restore: () => chain(),
    setTransform: () => chain(),
  } as unknown as CanvasRenderingContext2D;

  return mock;
}

function manyPerformanceItems(count: number): ItineraryTimelineItem[] {
  return Array.from({ length: count }, (_, i) => ({
    id: `perf-${i}`,
    time: `${String(10 + (i % 12)).padStart(2, '0')}:${i % 2 === 0 ? '00' : '30'}`,
    dotColor: 'pink' as const,
    title: `ARTIST ${i} · 主舞台`,
  }));
}

describe('drawItineraryWallpaper', () => {
  const sections: ItineraryWallpaperSection[] = buildWallpaperSectionsByDate(
    MY_ITINERARY_DAYS.map((day) => ({
      dateKey: day.id,
      dateLabel: day.bannerDateLabel,
      items: day.items,
    })),
  );

  const canvas = { width: 1080, height: 2340, scaleFactor: 1080 / 390 };

  it('paints title, event meta, and both date labels', () => {
    const ctx = createMockContext();
    const mockCtx = ctx as unknown as {
      calls: { method: string; args: unknown[] }[];
    };

    drawItineraryWallpaper(ctx, {
      ...canvas,
      sections,
      eventMeta: '风暴电音节 深圳站',
    });

    const texts = mockCtx.calls
      .filter((c) => c.method === 'fillText')
      .map((c) => String(c.args[0]));

    expect(texts).toContain('我的专属行程');
    expect(texts.some((t) => t.includes('风暴电音节'))).toBe(true);
    expect(texts.some((t) => t.includes('深圳站'))).toBe(true);
    expect(texts).toContain('6月13日');
    expect(texts).toContain('6月14日');
    expect(texts.some((t) => t.includes('EXCISION'))).toBe(true);
    expect(texts.some((t) => t.includes('MARSHMELLO'))).toBe(true);
  });

  it('reserves clock band and bottom safe area per design spec', () => {
    const layout = computeWallpaperLayout(
      canvas.width,
      canvas.height,
      sections,
      '风暴电音节 深圳站',
      canvas.scaleFactor,
    );
    const insets = lockScreenInsets(canvas.height, layout.s);

    expect(layout.clockZoneH).toBeCloseTo(insets.clockZoneH, 0);
    expect(layout.bottomSafeH).toBeCloseTo(insets.bottomSafeH, 0);
    expect(layout.clockZoneH).toBeGreaterThanOrEqual(canvas.height * 0.26);
    expect(layout.bottomSafeH).toBeGreaterThanOrEqual(canvas.height * 0.1);
    expect(layout.headerTop).toBeGreaterThan(layout.clockZoneH);
    expect(layout.footerBaseY).toBeLessThan(canvas.height - layout.bottomSafeH * 0.2);
    expect(layout.contentBottom).toBeCloseTo(
      canvas.height * WALLPAPER_DESIGN.contentBottomRatio,
      0,
    );
  });

  it('distributes rows to fill the content band when performances are few', () => {
    const layout = computeWallpaperLayout(
      canvas.width,
      canvas.height,
      sections,
      '风暴',
      canvas.scaleFactor,
    );
    const contentBottom = estimateWallpaperContentBottom(
      canvas.width,
      canvas.height,
      sections,
      '风暴',
      canvas.scaleFactor,
    );

    expect(layout.rowH).toBeGreaterThanOrEqual(40 * layout.s);
    const zoneUsed = contentBottom - layout.headerBottom;
    const zoneH = layout.contentBottom - layout.headerBottom;
    expect(zoneUsed / zoneH).toBeGreaterThan(0.65);
    expect(contentBottom).toBeLessThanOrEqual(layout.contentBottom + layout.s);
  });

  it('compresses rows to fit many performances within the content band', () => {
    const denseSections = buildWallpaperSectionsByDate([
      {
        dateKey: 'jun13',
        dateLabel: '6月13日',
        items: manyPerformanceItems(10),
      },
      {
        dateKey: 'jun14',
        dateLabel: '6月14日',
        items: manyPerformanceItems(8),
      },
    ]);

    const layout = computeWallpaperLayout(
      canvas.width,
      canvas.height,
      denseSections,
      '风暴电音节 深圳站',
      canvas.scaleFactor,
    );
    const contentBottom = estimateWallpaperContentBottom(
      canvas.width,
      canvas.height,
      denseSections,
      '风暴电音节 深圳站',
      canvas.scaleFactor,
    );

    expect(layout.compact).toBe(true);
    expect(contentBottom).toBeLessThanOrEqual(layout.contentBottom + layout.s);
    expect(denseSections.reduce((n, s) => n + s.rows.length, 0)).toBe(18);
  });
});
