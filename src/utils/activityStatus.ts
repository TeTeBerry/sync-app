export type ActivityStatus = "not_started" | "in_progress" | "ended";

type ParsedActivityDates = {
  start: Date;
  end: Date;
};

function toStartOfDay(year: number, month: number, day: number): Date {
  return new Date(year, month - 1, day, 0, 0, 0, 0);
}

function toEndOfDay(year: number, month: number, day: number): Date {
  return new Date(year, month - 1, day, 23, 59, 59, 999);
}

export function extractYearFromText(text?: string): string | undefined {
  if (!text) return undefined;
  const match = text.match(/\b(20\d{2})\b/);
  return match?.[1];
}

/** Parse catalog-style activity date strings (e.g. 06/13-14, 12/11-13, 2025-07-12). */
export function parseActivityDateRange(
  dateStr: string,
  yearHint?: string,
): ParsedActivityDates | null {
  const trimmed = dateStr.trim();
  if (!trimmed) return null;

  const iso = trimmed.match(/^(\d{4})-(\d{2})-(\d{2})$/);
  if (iso) {
    const year = Number(iso[1]);
    const month = Number(iso[2]);
    const day = Number(iso[3]);
    return {
      start: toStartOfDay(year, month, day),
      end: toEndOfDay(year, month, day),
    };
  }

  const year = Number(yearHint ?? new Date().getFullYear());

  const sameMonthRange = trimmed.match(/(\d{1,2})\/(\d{1,2})\s*[–-]\s*(\d{1,2})/);
  if (sameMonthRange) {
    const month = Number(sameMonthRange[1]);
    const startDay = Number(sameMonthRange[2]);
    const endDay = Number(sameMonthRange[3]);
    return {
      start: toStartOfDay(year, month, startDay),
      end: toEndOfDay(year, month, endDay),
    };
  }

  const slashDate = trimmed.match(/(\d{1,2})\/(\d{1,2})/);
  if (slashDate) {
    const month = Number(slashDate[1]);
    const day = Number(slashDate[2]);
    return {
      start: toStartOfDay(year, month, day),
      end: toEndOfDay(year, month, day),
    };
  }

  const cnDate = trimmed.match(/(20\d{2})?[年.\-/]?(\d{1,2})[月.\-/](\d{1,2})/);
  if (cnDate) {
    const resolvedYear = cnDate[1] ? Number(cnDate[1]) : year;
    const month = Number(cnDate[2]);
    const day = Number(cnDate[3]);
    return {
      start: toStartOfDay(resolvedYear, month, day),
      end: toEndOfDay(resolvedYear, month, day),
    };
  }

  return null;
}

/** 开场前 1.5 个月（45 天）起视为进行中，便于组队/预热 */
const PRE_EVENT_WINDOW_MS = 45 * 24 * 60 * 60 * 1000;

export function getActivityStatus(
  dateStr?: string,
  options?: { yearHint?: string; now?: Date },
): ActivityStatus {
  if (!dateStr?.trim()) return "not_started";

  const parsed = parseActivityDateRange(dateStr, options?.yearHint);
  if (!parsed) return "not_started";

  const now = options?.now ?? new Date();
  if (now > parsed.end) return "ended";

  const preStart = new Date(parsed.start.getTime() - PRE_EVENT_WINDOW_MS);
  if (now < preStart) return "not_started";

  return "in_progress";
}

export function getActivityStatusFromActivity(
  date?: string,
  title?: string,
  now?: Date,
): ActivityStatus {
  const yearHint = extractYearFromText(title) ?? extractYearFromText(date);
  return getActivityStatus(date, { yearHint, now });
}

export function shouldShowActivityStatusBadge(status: ActivityStatus): boolean {
  return status !== "in_progress";
}

export function activityStatusBadgeClass(status: ActivityStatus): string {
  return `s-activity-status s-activity-status--${status.replace("_", "-")}`;
}

export function activityStatusCardClass(status: ActivityStatus): string {
  return status === "ended" ? "s-activity-card--ended" : "";
}

export function activityStatusText(status: ActivityStatus): string {
  switch (status) {
    case "in_progress":
      return "进行中";
    case "ended":
      return "已结束";
    default:
      return "未开始";
  }
}

export function getActivitySortTimestamp(date?: string, title?: string): number {
  const yearHint = extractYearFromText(title) ?? extractYearFromText(date);
  const parsed = date?.trim() ? parseActivityDateRange(date, yearHint) : null;
  return parsed?.start.getTime() ?? 0;
}

export function compareActivityDateDesc(
  a: { date?: string; title?: string },
  b: { date?: string; title?: string },
): number {
  return getActivitySortTimestamp(b.date, b.title) - getActivitySortTimestamp(a.date, a.title);
}

export function compareActivityDateAsc(
  a: { date?: string; title?: string },
  b: { date?: string; title?: string },
): number {
  return getActivitySortTimestamp(a.date, a.title) - getActivitySortTimestamp(b.date, b.title);
}

/** Event list: upcoming/ongoing by start asc (soonest first), ended after, missing dates last. */
export function compareActivitiesNearestFirst(
  a: { date?: string; title?: string },
  b: { date?: string; title?: string },
  now?: Date,
): number {
  const aEnded = getActivityStatusFromActivity(a.date, a.title, now) === "ended";
  const bEnded = getActivityStatusFromActivity(b.date, b.title, now) === "ended";
  if (aEnded !== bEnded) return aEnded ? 1 : -1;

  const aTs = getActivitySortTimestamp(a.date, a.title);
  const bTs = getActivitySortTimestamp(b.date, b.title);
  const aMissing = aTs <= 0;
  const bMissing = bTs <= 0;
  if (aMissing !== bMissing) return aMissing ? 1 : -1;
  if (aMissing) return 0;

  if (aEnded) return bTs - aTs;
  return aTs - bTs;
}

export type ActivityDateFields = {
  date?: string;
  title?: string;
  name?: string;
};

function activityTitleFromFields(item: ActivityDateFields): string | undefined {
  return item.title ?? item.name;
}

/** Nearest activity that has not ended and whose start is still in the future. */
export function findNearestUpcomingActivity<T extends ActivityDateFields>(
  activities: T[],
  now = new Date(),
): (T & { startAt: Date }) | null {
  const nowMs = now.getTime();
  let nearest: { item: T; startAt: Date; startMs: number } | null = null;

  for (const item of activities) {
    const title = activityTitleFromFields(item);
    if (getActivityStatusFromActivity(item.date, title, now) === "ended") continue;

    const startMs = getActivitySortTimestamp(item.date, title);
    if (startMs <= 0 || startMs <= nowMs) continue;

    if (!nearest || startMs < nearest.startMs) {
      nearest = { item, startAt: new Date(startMs), startMs };
    }
  }

  return nearest ? { ...nearest.item, startAt: nearest.startAt } : null;
}
