import { describe, expect, it } from "vitest";
import type { ItineraryTimelineItem } from "./myItineraryMock";
import { MY_ITINERARY_DAYS } from "./myItineraryMock";
import {
  buildWallpaperRows,
  buildWallpaperSectionsByDate,
  isPerformanceTimelineItem,
  parseTitleArtistStage,
  timelineItemToWallpaperRow,
} from "./itineraryWallpaperParse";

describe("parseTitleArtistStage", () => {
  it("splits artist and stage on middle dot separator", () => {
    expect(parseTitleArtistStage("Marshmello · A舞台 (主舞台)")).toEqual({
      artist: "Marshmello",
      stage: "A舞台 (主舞台)",
    });
    expect(parseTitleArtistStage("Eric Prydz · B舞台")).toEqual({
      artist: "Eric Prydz",
      stage: "B舞台",
    });
  });

  it("uses subtitle as stage when title has no separator", () => {
    expect(parseTitleArtistStage("出发前往场馆", "建议提前 1.5 小时出发")).toEqual({
      artist: "出发前往场馆",
      stage: "建议提前 1.5 小时出发",
    });
  });

  it("returns empty stage when no subtitle and no separator", () => {
    expect(parseTitleArtistStage("户外区 Brunch 休息")).toEqual({
      artist: "户外区 Brunch 休息",
      stage: "",
    });
  });
});

describe("isPerformanceTimelineItem", () => {
  it("excludes departure and travel-reminder nodes", () => {
    expect(
      isPerformanceTimelineItem({
        id: "depart",
        time: "17:30",
        dotColor: "pink",
        title: "出发前往场馆",
        pill: { label: "出行提醒", variant: "green" },
      }),
    ).toBe(false);
  });

  it("excludes items without artist · stage in title", () => {
    expect(
      isPerformanceTimelineItem({
        id: "brunch",
        time: "12:00",
        dotColor: "cyan",
        title: "户外区 Brunch 休息",
      }),
    ).toBe(false);
  });

  it("includes performance items with artist and stage", () => {
    expect(
      isPerformanceTimelineItem({
        id: "marshmello",
        time: "21:00",
        dotColor: "pink",
        title: "Marshmello · A舞台 (主舞台)",
        highlighted: true,
      }),
    ).toBe(true);
  });
});

describe("buildWallpaperRows", () => {
  const sample: ItineraryTimelineItem[] = [
    {
      id: "a",
      time: "17:30",
      dotColor: "pink",
      title: "出发前往场馆",
      pill: { label: "出行提醒", variant: "green" },
    },
    {
      id: "b",
      time: "21:00",
      dotColor: "pink",
      title: "Marshmello · A舞台 (主舞台)",
      highlighted: true,
    },
    {
      id: "c",
      time: "22:30",
      dotColor: "purple",
      title: "ILLENIUM · A舞台 (主舞台)",
    },
  ];

  it("keeps performances in timeline order and skips travel nodes", () => {
    const { rows } = buildWallpaperRows(sample, 8);
    expect(rows).toHaveLength(2);
    expect(rows[0]?.artist).toBe("Marshmello");
    expect(rows[1]?.artist).toBe("ILLENIUM");
    expect(rows.some((r) => r.artist.includes("出发"))).toBe(false);
  });

  it("does not reorder highlighted performances ahead of earlier slots", () => {
    const items: ItineraryTimelineItem[] = [
      {
        id: "early",
        time: "20:00",
        dotColor: "cyan",
        title: "ILLENIUM · A舞台 (主舞台)",
      },
      {
        id: "late",
        time: "21:00",
        dotColor: "pink",
        title: "Marshmello · A舞台 (主舞台)",
        highlighted: true,
      },
    ];
    const { rows } = buildWallpaperRows(items, 8);
    expect(rows.map((r) => r.artist)).toEqual(["ILLENIUM", "Marshmello"]);
  });

  it("truncates when exceeding max rows", () => {
    const many = Array.from({ length: 10 }, (_, i) => ({
      id: `id-${i}`,
      time: `1${i}:00`,
      dotColor: "cyan" as const,
      title: `Artist ${i} · Stage ${i}`,
    }));
    const { rows, truncated, hiddenCount } = buildWallpaperRows(many, 8);
    expect(rows).toHaveLength(8);
    expect(truncated).toBe(true);
    expect(hiddenCount).toBe(2);
  });
});

describe("buildWallpaperSectionsByDate", () => {
  it("groups performances by date and omits days without performances", () => {
    const sections = buildWallpaperSectionsByDate(
      MY_ITINERARY_DAYS.map((day) => ({
        dateKey: day.id,
        dateLabel: day.bannerDateLabel,
        items: day.items,
      })),
    );

    expect(sections).toHaveLength(2);
    expect(sections[0]?.dateLabel).toBe("6月13日");
    expect(sections[0]?.rows.map((r) => r.artist)).toEqual(["EXCISION", "MARSHMELLO"]);
    expect(sections[1]?.dateLabel).toBe("6月14日");
    expect(sections[1]?.rows.map((r) => r.artist)).toEqual(["ERIC PRYDZ", "ILLENIUM"]);
  });

  it("skips days with only travel or non-performance nodes", () => {
    const sections = buildWallpaperSectionsByDate([
      {
        dateKey: "empty",
        dateLabel: "6月15日",
        items: [
          {
            id: "depart",
            time: "17:30",
            dotColor: "pink",
            title: "出发前往场馆",
            pill: { label: "出行提醒", variant: "green" },
          },
        ],
      },
    ]);
    expect(sections).toHaveLength(0);
  });
});

describe("timelineItemToWallpaperRow", () => {
  it("maps timeline fields to wallpaper row", () => {
    const row = timelineItemToWallpaperRow({
      id: "marshmello",
      time: "21:00",
      dotColor: "pink",
      title: "Marshmello · A舞台 (主舞台)",
      highlighted: true,
    });
    expect(row).toMatchObject({
      time: "21:00",
      artist: "Marshmello",
      stage: "A舞台 (主舞台)",
      dotColor: "pink",
    });
    expect(row).not.toHaveProperty("highlighted");
  });
});
