import { describe, expect, it } from "vitest";
import {
  buildWallpaperSectionsByDate,
  type ItineraryWallpaperSection,
} from "./itineraryWallpaperParse";
import { MY_ITINERARY_DAYS } from "./myItineraryMock";
import {
  computeWallpaperLayout,
  drawItineraryWallpaper,
  estimateWallpaperContentHeight,
} from "./itineraryWallpaperDraw";

function createMockContext(): CanvasRenderingContext2D {
  const calls: { method: string; args: unknown[] }[] = [];
  const chain = () => mock as CanvasRenderingContext2D;

  const mock = {
    calls,
    clearRect: (...args: unknown[]) => {
      calls.push({ method: "clearRect", args });
      return chain();
    },
    fillRect: (...args: unknown[]) => {
      calls.push({ method: "fillRect", args });
      return chain();
    },
    fillText: (...args: unknown[]) => {
      calls.push({ method: "fillText", args });
      return chain();
    },
    stroke: () => {
      calls.push({ method: "stroke", args: [] });
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
    fillStyle: "",
    strokeStyle: "",
    lineWidth: 1,
    font: "",
    textAlign: "left" as CanvasTextAlign,
    textBaseline: "top" as CanvasTextBaseline,
    globalAlpha: 1,
    setTransform: () => chain(),
  } as unknown as CanvasRenderingContext2D;

  return mock;
}

describe("drawItineraryWallpaper", () => {
  const sections: ItineraryWallpaperSection[] = buildWallpaperSectionsByDate(
    MY_ITINERARY_DAYS.map((day) => ({
      dateKey: day.id,
      dateLabel: day.bannerDateLabel,
      items: day.items,
    })),
    32,
  );

  it("paints title, event meta, and both date labels", () => {
    const ctx = createMockContext();
    const mockCtx = ctx as unknown as {
      calls: { method: string; args: unknown[] }[];
    };

    drawItineraryWallpaper(ctx, {
      width: 1080,
      height: 2340,
      sections,
      eventMeta: "风暴电音节 深圳站",
      scaleFactor: 1080 / 390,
    });

    const texts = mockCtx.calls
      .filter((c) => c.method === "fillText")
      .map((c) => String(c.args[0]));

    expect(texts).toContain("我的专属行程");
    expect(texts.some((t) => t.includes("风暴电音节"))).toBe(true);
    expect(texts).toContain("6月13日");
    expect(texts).toContain("6月14日");
    expect(texts.some((t) => t.includes("EXCISION"))).toBe(true);
    expect(texts.some((t) => t.includes("MARSHMELLO"))).toBe(true);
  });

  it("compresses row height on short canvas to fit two days", () => {
    const tall = computeWallpaperLayout(1080, 2400, sections, "风暴", 1080 / 390);
    const short = computeWallpaperLayout(1080, 1600, sections, "风暴", 1080 / 390);
    expect(short.rowH).toBeLessThan(tall.rowH);
    expect(short.rowH).toBeGreaterThanOrEqual(64 * short.s);
  });

  it("estimates taller canvas for more date sections", () => {
    const oneDay = estimateWallpaperContentHeight([sections[0]!], 1080, 1);
    const twoDays = estimateWallpaperContentHeight(sections, 1080, 1, "风暴电音节 深圳站");
    expect(twoDays).toBeGreaterThan(oneDay);
  });
});
