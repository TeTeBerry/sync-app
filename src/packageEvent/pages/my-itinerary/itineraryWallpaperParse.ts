import type { ItineraryTimelineDotColor, ItineraryTimelineItem } from "./myItineraryMock";

const TITLE_STAGE_SEP = " · ";

export type ItineraryWallpaperRow = {
  time: string;
  artist: string;
  stage: string;
  dotColor: ItineraryTimelineDotColor;
};

export type ItineraryWallpaperDayInput = {
  dateKey: string;
  dateLabel: string;
  items: ItineraryTimelineItem[];
};

export type ItineraryWallpaperSection = {
  dateKey: string;
  dateLabel: string;
  rows: ItineraryWallpaperRow[];
  truncated: boolean;
  hiddenCount: number;
};

/** Split mock titles like `Marshmello · A舞台 (主舞台)` into artist + stage. */
export function parseTitleArtistStage(
  title: string,
  subtitle?: string,
): { artist: string; stage: string } {
  const trimmed = title.trim();
  const sepIndex = trimmed.indexOf(TITLE_STAGE_SEP);
  if (sepIndex >= 0) {
    return {
      artist: trimmed.slice(0, sepIndex).trim(),
      stage: trimmed.slice(sepIndex + TITLE_STAGE_SEP.length).trim(),
    };
  }
  const stageFromSub = subtitle?.trim();
  return {
    artist: trimmed,
    stage: stageFromSub ?? "",
  };
}

export function timelineItemToWallpaperRow(item: ItineraryTimelineItem): ItineraryWallpaperRow {
  const { artist, stage } = parseTitleArtistStage(item.title, item.subtitle);
  return {
    time: item.time,
    artist,
    stage,
    dotColor: item.dotColor,
  };
}

/** Performance rows only — excludes travel/departure reminders for lock-screen wallpaper. */
export function isPerformanceTimelineItem(item: ItineraryTimelineItem): boolean {
  if (item.title.includes("出发")) {
    return false;
  }
  if (item.pill?.label === "出行提醒") {
    return false;
  }
  const { artist, stage } = parseTitleArtistStage(item.title, item.subtitle);
  const hasArtistStageInTitle = item.title.includes(TITLE_STAGE_SEP);
  return hasArtistStageInTitle && Boolean(artist.trim() && stage.trim());
}

/**
 * Pick up to `maxRows` performance timeline nodes for one day section (time order).
 */
export function buildWallpaperRows(
  items: ItineraryTimelineItem[],
  maxRows = 8,
): { rows: ItineraryWallpaperRow[]; truncated: boolean; hiddenCount: number } {
  const performances = items.filter(isPerformanceTimelineItem);
  if (performances.length === 0) {
    return { rows: [], truncated: false, hiddenCount: 0 };
  }

  const truncated = performances.length > maxRows;
  const slice = performances.slice(0, maxRows);
  const hiddenCount = truncated ? performances.length - maxRows : 0;

  return {
    rows: slice.map(timelineItemToWallpaperRow),
    truncated,
    hiddenCount,
  };
}

/**
 * Build wallpaper sections grouped by date. Days without performances are omitted.
 */
export function buildWallpaperSectionsByDate(
  days: ItineraryWallpaperDayInput[],
  maxRowsPerSection = 8,
): ItineraryWallpaperSection[] {
  const sections: ItineraryWallpaperSection[] = [];

  for (const day of days) {
    const { rows, truncated, hiddenCount } = buildWallpaperRows(day.items, maxRowsPerSection);
    if (rows.length === 0) {
      continue;
    }
    sections.push({
      dateKey: day.dateKey,
      dateLabel: day.dateLabel,
      rows,
      truncated,
      hiddenCount,
    });
  }

  return sections;
}
