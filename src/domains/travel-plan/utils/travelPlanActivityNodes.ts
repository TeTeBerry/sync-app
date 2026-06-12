import { boundsToIsoDate, parseActivityDateBounds } from '@/utils/activityDateBounds';
import { formatTravelPlanTimeLabel } from './travelPlanDateTime';
import type { TravelPlanNode } from '../types';

const MONTH_MAP: Record<string, number> = {
  jan: 1,
  feb: 2,
  mar: 3,
  apr: 4,
  may: 5,
  jun: 6,
  jul: 7,
  aug: 8,
  sep: 9,
  oct: 10,
  nov: 11,
  dec: 12,
};

const MONTH_ABBR = Object.entries(MONTH_MAP).map(
  ([key, value]) => [value, key] as const,
);

function extractYearFromText(text?: string) {
  if (!text?.trim()) {
    return undefined;
  }
  const match = text.match(/\b(20\d{2})\b/);
  return match?.[1];
}

function isoDateFromFestivalDateKey(dateKey: string, yearHint: string) {
  const match = dateKey
    .trim()
    .toLowerCase()
    .match(/^([a-z]{3})(\d{1,2})$/);
  if (!match) {
    return null;
  }

  const month = MONTH_MAP[match[1]];
  const day = Number(match[2]);
  const year = Number(yearHint);
  if (!month || !Number.isFinite(day) || !Number.isFinite(year)) {
    return null;
  }

  return `${year}-${String(month).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
}

function isoToFestivalDateKey(isoDate: string) {
  const [, month, day] = isoDate.split('-').map(Number);
  const monthKey = MONTH_ABBR.find(([value]) => value === month)?.[1];
  return monthKey && Number.isFinite(day) ? `${monthKey}${day}` : isoDate;
}

function resolveActivitySubtitle(
  location: string | undefined,
  dayIndex: number,
  dayCount: number,
) {
  const venue = location?.trim() || '活动现场';
  if (dayCount <= 1) {
    return venue;
  }
  if (dayIndex === 0) {
    return `${venue} · 主舞台`;
  }
  if (dayIndex === dayCount - 1) {
    return `${venue} · 全场开放`;
  }
  return `${venue} · 活动现场`;
}

function buildActivityNode(
  input: {
    eventName: string;
    location?: string;
    activityConfirmations?: Record<string, boolean>;
  },
  isoDate: string,
  index: number,
  dayCount: number,
): TravelPlanNode {
  const nodeId = `activity-event-${isoToFestivalDateKey(isoDate)}`;
  const timeRange = { startDate: isoDate, endDate: isoDate };
  const dayNumber = index + 1;

  return {
    id: nodeId,
    category: 'event' as const,
    source: 'activity' as const,
    startDate: isoDate,
    endDate: isoDate,
    timeLabel: formatTravelPlanTimeLabel(timeRange),
    title: `${input.eventName} · Day ${dayNumber}`,
    subtitle: resolveActivitySubtitle(input.location, index, dayCount),
    detail:
      dayNumber === 1
        ? '建议提前 1 小时入场，预留安检时间'
        : '压轴阵容日 · 建议全程在场',
    price: index === 0 ? 880 : undefined,
    confirmed: input.activityConfirmations?.[nodeId] ?? true,
  };
}

function buildNodesFromActivityDate(input: {
  eventName: string;
  activityDate?: string;
  location?: string;
  activityConfirmations?: Record<string, boolean>;
}): TravelPlanNode[] {
  const bounds = parseActivityDateBounds(input.activityDate);
  if (!bounds) {
    return [];
  }

  const nodes: TravelPlanNode[] = [];
  for (let day = bounds.dayStart; day <= bounds.dayEnd; day += 1) {
    const isoDate = boundsToIsoDate(bounds, day);
    nodes.push(
      buildActivityNode(
        input,
        isoDate,
        day - bounds.dayStart,
        bounds.dayEnd - bounds.dayStart + 1,
      ),
    );
  }

  return nodes;
}

export function buildDefaultActivityTravelPlanNodes(input: {
  activityLegacyId: number;
  eventName: string;
  activityDate?: string;
  location?: string;
  sessions?: Array<{ dateKey: string; label: string }>;
  activityConfirmations?: Record<string, boolean>;
}): TravelPlanNode[] {
  const yearHint =
    extractYearFromText(input.eventName) ??
    extractYearFromText(input.activityDate) ??
    String(new Date().getFullYear());

  const sessions = input.sessions?.length ? input.sessions : [];

  if (sessions.length > 0) {
    return sessions.map((session, index) => {
      const isoDate =
        isoDateFromFestivalDateKey(session.dateKey, yearHint) ?? `${yearHint}-06-13`;

      return buildActivityNode(input, isoDate, index, sessions.length);
    });
  }

  return buildNodesFromActivityDate(input);
}
