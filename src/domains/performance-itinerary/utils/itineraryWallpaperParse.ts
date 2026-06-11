import type {
  ItineraryTimelineDotColor,
  ItineraryTimelineItem,
} from '../mocks/myItineraryMock';

/** Title separators: middle dot (API/LLM), hyphen, pipe. */
const TITLE_STAGE_SEP_PATTERNS = [
  /\s*·\s*/,
  /\s+-\s+/,
  /\s*–\s*/,
  /\s*—\s*/,
  /\s*\|\s*/,
];

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
};
/** Split titles like `Marshmello · A舞台` or `SLANDER - Main` into artist + stage. */
export function parseTitleArtistStage(
  title: string,
  subtitle?: string,
): { artist: string; stage: string } {
  const trimmed = title.trim();
  for (const pattern of TITLE_STAGE_SEP_PATTERNS) {
    const match = pattern.exec(trimmed);
    if (match != null && match.index != null && match.index > 0) {
      return {
        artist: trimmed.slice(0, match.index).trim(),
        stage: trimmed.slice(match.index + match[0].length).trim(),
      };
    }
  }
  const stageFromSub = subtitle?.trim();
  return {
    artist: trimmed,
    stage: stageFromSub ?? '',
  };
}

function resolveWallpaperStage(
  artist: string,
  stage: string,
  subtitle?: string,
): string {
  if (stage.trim()) return stage.trim();
  const sub = subtitle?.trim();
  if (!sub) return '主舞台';
  const firstLine = sub.split(/[·|]/)[0]?.trim();
  return firstLine || '主舞台';
}

export function timelineItemToWallpaperRow(
  item: ItineraryTimelineItem,
): ItineraryWallpaperRow {
  const { artist, stage } = parseTitleArtistStage(item.title, item.subtitle);
  return {
    time: item.time,
    artist,
    stage: resolveWallpaperStage(artist, stage, item.subtitle),
    dotColor: item.dotColor,
  };
}

/** Travel / rest nodes — not shown on lock-screen wallpaper. */
export function isTravelTimelineItem(item: ItineraryTimelineItem): boolean {
  if (item.pill?.label === '出行提醒') {
    return true;
  }
  const title = item.title.trim();
  if (title.includes('出发前往') || title.includes('散场返程')) {
    return true;
  }
  if (/^(出发|散场|返程|午间休息)/.test(title)) {
    return true;
  }
  if (item.pill?.label === '休息推荐') {
    return true;
  }
  return false;
}

function titleHasArtistStageSeparator(title: string): boolean {
  return TITLE_STAGE_SEP_PATTERNS.some((pattern) => {
    const match = pattern.exec(title.trim());
    return match != null && match.index != null && match.index > 0;
  });
}

/** Performance rows for wallpaper — matches API fallback + LLM itinerary shapes. */
export function isPerformanceTimelineItem(item: ItineraryTimelineItem): boolean {
  if (isTravelTimelineItem(item)) {
    return false;
  }

  const { artist, stage } = parseTitleArtistStage(item.title, item.subtitle);
  if (titleHasArtistStageSeparator(item.title) && artist.trim()) {
    return true;
  }

  if (item.timeTag?.trim() && artist.trim()) {
    return true;
  }

  if (item.highlighted && artist.trim()) {
    return true;
  }

  if (item.pill?.variant === 'pink' && artist.trim()) {
    return true;
  }

  return Boolean(artist.trim() && stage.trim());
}

/** All performance timeline nodes for one day section (time order). */
export function buildWallpaperRows(
  items: ItineraryTimelineItem[],
): ItineraryWallpaperRow[] {
  return items.filter(isPerformanceTimelineItem).map(timelineItemToWallpaperRow);
}

/**
 * Build wallpaper sections grouped by date. Days without performances are omitted.
 */
export function buildWallpaperSectionsByDate(
  days: ItineraryWallpaperDayInput[],
): ItineraryWallpaperSection[] {
  const sections: ItineraryWallpaperSection[] = [];

  for (const day of days) {
    const rows = buildWallpaperRows(day.items);
    if (rows.length === 0) {
      continue;
    }
    sections.push({
      dateKey: day.dateKey,
      dateLabel: day.dateLabel,
      rows,
    });
  }

  return sections;
}
