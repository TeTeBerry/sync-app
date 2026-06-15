import dayjs from 'dayjs';
import customParseFormat from 'dayjs/plugin/customParseFormat';

dayjs.extend(customParseFormat);

const ISO_DATE = 'YYYY-MM-DD';

export type CalendarDay = {
  year: number;
  month: number;
  day: number;
};

export type TravelPlanTimeRange = {
  startDate: string;
  endDate: string;
  startTime?: string;
  endTime?: string;
};

function parseIsoDate(iso: string) {
  return dayjs(iso.trim(), ISO_DATE, true);
}

function dayFromParts(parts: CalendarDay) {
  return dayjs()
    .year(parts.year)
    .month(parts.month - 1)
    .date(parts.day)
    .startOf('day');
}

export function createDefaultTravelPlanTimeRange(
  date: Date = new Date(),
): TravelPlanTimeRange {
  const iso = dayjs(date).format(ISO_DATE);
  return {
    startDate: iso,
    endDate: iso,
  };
}

export const DEFAULT_TRAVEL_PLAN_TIME_RANGE = createDefaultTravelPlanTimeRange();

export function isoDateFromParts(parts: CalendarDay): string {
  return dayFromParts(parts).format(ISO_DATE);
}

export function partsFromIsoDate(iso: string): CalendarDay | null {
  const parsed = parseIsoDate(iso);
  if (!parsed.isValid()) {
    return null;
  }
  return {
    year: parsed.year(),
    month: parsed.month() + 1,
    day: parsed.date(),
  };
}

export function isDayInRange(
  day: CalendarDay,
  start: CalendarDay,
  end: CalendarDay,
): boolean {
  const value = dayFromParts(day);
  const rangeStart = dayFromParts(start);
  const rangeEnd = dayFromParts(end);
  return (
    !value.isBefore(rangeStart, 'day') &&
    (value.isBefore(rangeEnd, 'day') || value.isSame(rangeEnd, 'day'))
  );
}

export function normalizeTravelPlanTimeRange(
  range: TravelPlanTimeRange,
): TravelPlanTimeRange {
  const start = parseIsoDate(range.startDate);
  const end = parseIsoDate(range.endDate);
  if (!start.isValid() || !end.isValid() || !start.isAfter(end, 'day')) {
    return range;
  }
  return {
    startDate: range.endDate,
    endDate: range.startDate,
  };
}

export function applyCalendarDayToRange(
  range: TravelPlanTimeRange,
  day: CalendarDay,
): TravelPlanTimeRange {
  const iso = isoDateFromParts(day);
  const start = parseIsoDate(range.startDate);
  const end = parseIsoDate(range.endDate);
  const hasFullRange = start.isValid() && end.isValid() && !start.isSame(end, 'day');

  if (!start.isValid() || hasFullRange) {
    return normalizeTravelPlanTimeRange({
      ...range,
      startDate: iso,
      endDate: iso,
    });
  }

  const picked = dayFromParts(day);
  if (picked.isBefore(start, 'day')) {
    return normalizeTravelPlanTimeRange({
      ...range,
      startDate: iso,
      endDate: range.startDate,
    });
  }

  return normalizeTravelPlanTimeRange({
    ...range,
    endDate: iso,
  });
}

function formatDateToken(date: dayjs.Dayjs, time?: string) {
  const dateLabel = date.format('MM/DD');
  const trimmedTime = time?.trim();
  return trimmedTime ? `${dateLabel} ${trimmedTime}` : dateLabel;
}

export function formatTravelPlanTimeLabel(range: TravelPlanTimeRange): string {
  const normalized = normalizeTravelPlanTimeRange(range);
  const start = parseIsoDate(normalized.startDate);
  const end = parseIsoDate(normalized.endDate);
  if (!start.isValid()) {
    return '';
  }
  if (!end.isValid() || start.isSame(end, 'day')) {
    const startTime = normalized.startTime?.trim();
    const endTime = normalized.endTime?.trim();
    if (startTime && endTime && startTime !== endTime) {
      return `${start.format('MM/DD')} ${startTime}–${endTime}`;
    }
    return formatDateToken(start, startTime ?? endTime);
  }
  return `${formatDateToken(start, normalized.startTime)}–${formatDateToken(end, normalized.endTime)}`;
}

export function formatTravelPlanDuration(
  range: TravelPlanTimeRange,
): string | undefined {
  const normalized = normalizeTravelPlanTimeRange(range);
  const start = parseIsoDate(normalized.startDate);
  const end = parseIsoDate(normalized.endDate);
  if (!start.isValid() || !end.isValid() || start.isSame(end, 'day')) {
    return undefined;
  }

  const dayDiff = end.diff(start, 'day');
  if (dayDiff <= 0) {
    return undefined;
  }

  return `${dayDiff}晚`;
}

export function computeTravelPlanDateRangeLabel(
  nodes: Array<Pick<{ startDate: string; endDate: string }, 'startDate' | 'endDate'>>,
): string {
  if (!nodes.length) {
    return '';
  }

  const timestamps = nodes
    .flatMap((node) => [node.startDate, node.endDate])
    .map((iso) => parseIsoDate(iso))
    .filter((parsed) => parsed.isValid())
    .map((parsed) => parsed.valueOf())
    .sort((a, b) => a - b);

  if (!timestamps.length) {
    return '';
  }

  const start = dayjs(timestamps[0]);
  const end = dayjs(timestamps[timestamps.length - 1]);
  if (start.isSame(end, 'day')) {
    return start.format('MM/DD');
  }

  return `${start.format('MM/DD')}–${end.format('MM/DD')}`;
}

export function formatTravelPlanRangeSummary(range: TravelPlanTimeRange): string {
  const normalized = normalizeTravelPlanTimeRange(range);
  const start = parseIsoDate(normalized.startDate);
  const end = parseIsoDate(normalized.endDate);
  if (!start.isValid()) {
    return '请选择日期范围';
  }

  const startDateLabel = start.format('M月D日');
  if (!end.isValid() || start.isSame(end, 'day')) {
    return startDateLabel;
  }

  return `${startDateLabel} – ${end.format('M月D日')}`;
}
