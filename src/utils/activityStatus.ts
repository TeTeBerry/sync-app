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

/** Parse catalog-style activity date strings (e.g. 07/12-13, 08/01-03, 2025-07-12). */
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

export function getActivityStatus(
  dateStr?: string,
  options?: { yearHint?: string; now?: Date },
): ActivityStatus {
  if (!dateStr?.trim()) return "not_started";

  const parsed = parseActivityDateRange(dateStr, options?.yearHint);
  if (!parsed) return "not_started";

  const now = options?.now ?? new Date();
  if (now < parsed.start) return "not_started";
  if (now > parsed.end) return "ended";
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

export function activityStatusI18nKey(
  status: ActivityStatus,
): "activityStatus.notStarted" | "activityStatus.inProgress" | "activityStatus.ended" {
  switch (status) {
    case "in_progress":
      return "activityStatus.inProgress";
    case "ended":
      return "activityStatus.ended";
    default:
      return "activityStatus.notStarted";
  }
}
