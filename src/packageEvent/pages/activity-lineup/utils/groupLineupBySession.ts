import type { ItineraryScheduleSnapshot } from '@/types/backend';

export type LineupSessionGroup = {
  dateKey: string;
  label: string;
  bannerDateLabel: string;
  performances: ItineraryScheduleSnapshot['performances'];
};

export function groupPerformancesBySession(
  schedule: Pick<ItineraryScheduleSnapshot, 'sessions' | 'performances'>,
): LineupSessionGroup[] {
  const byDateKey = new Map<string, ItineraryScheduleSnapshot['performances']>();

  for (const performance of schedule.performances) {
    const list = byDateKey.get(performance.dateKey) ?? [];
    list.push(performance);
    byDateKey.set(performance.dateKey, list);
  }

  return schedule.sessions
    .map((session) => ({
      dateKey: session.dateKey,
      label: session.label,
      bannerDateLabel: session.bannerDateLabel,
      performances: [...(byDateKey.get(session.dateKey) ?? [])].sort(
        (a, b) => a.startMinutes - b.startMinutes,
      ),
    }))
    .filter((session) => session.performances.length > 0);
}

export function formatLineupTimeRange(startTime: string, endTime: string): string {
  const start = startTime.trim();
  const end = endTime.trim();
  if (!start && !end) {
    return '';
  }
  if (!end || start === end) {
    return start;
  }
  return `${start} — ${end}`;
}
