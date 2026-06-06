export const STORM_FLOOR_ACTIVITY_LEGACY_ID = 4;

export type StormFloorPerformance = {
  artistId: string;
  artistName: string;
  dateKey: string;
  startTime: string;
  endTime: string;
  startMinutes: number;
  endMinutes: number;
  genreColor: string;
};

const FESTIVAL_DATE_BY_KEY: Record<
  string,
  { year: number; month: number; day: number }
> = {
  jun13: { year: 2026, month: 6, day: 13 },
  jun14: { year: 2026, month: 6, day: 14 },
};

function perf(
  input: Omit<StormFloorPerformance, 'startMinutes' | 'endMinutes'> & {
    startMinutes?: number;
    endMinutes?: number;
  },
): StormFloorPerformance {
  const startMinutes = input.startMinutes ?? parseTimeToMinutes(input.startTime);
  let endMinutes = input.endMinutes ?? parseTimeToMinutes(input.endTime);
  if (endMinutes <= startMinutes) {
    endMinutes += 24 * 60;
  }
  return { ...input, startMinutes, endMinutes };
}

function parseTimeToMinutes(time: string): number {
  const [h, m] = time.split(':').map(Number);
  return h * 60 + m;
}

/** 与 backend itinerary.seed 一致，离线也可展示当前场次 */
export const STORM_FLOOR_MOCK_PERFORMANCES: StormFloorPerformance[] = [
  perf({
    dateKey: 'jun13',
    artistId: 'blondex',
    artistName: 'BLONDEX',
    startTime: '16:00',
    endTime: '17:00',
    genreColor: '#22d3ee',
  }),
  perf({
    dateKey: 'jun13',
    artistId: 'ghengar',
    artistName: 'GHENGAR (GHASTLY)',
    startTime: '17:00',
    endTime: '18:00',
    genreColor: '#ef4444',
  }),
  perf({
    dateKey: 'jun13',
    artistId: 'andy-c',
    artistName: 'ANDY C',
    startTime: '18:00',
    endTime: '19:00',
    genreColor: '#22c55e',
  }),
  perf({
    dateKey: 'jun13',
    artistId: 'excision',
    artistName: 'EXCISION',
    startTime: '19:00',
    endTime: '20:15',
    genreColor: '#f97316',
  }),
  perf({
    dateKey: 'jun13',
    artistId: 'marshmello',
    artistName: 'MARSHMELLO',
    startTime: '20:30',
    endTime: '22:00',
    genreColor: '#ff2d55',
  }),
  perf({
    dateKey: 'jun14',
    artistId: 'vidojean',
    artistName: 'VIDOJEAN (VJ X OL)',
    startTime: '16:00',
    endTime: '17:00',
    genreColor: '#eab308',
  }),
  perf({
    dateKey: 'jun14',
    artistId: 'julian-jordan',
    artistName: 'JULIAN JORDAN',
    startTime: '17:00',
    endTime: '18:00',
    genreColor: '#a855f7',
  }),
  perf({
    dateKey: 'jun14',
    artistId: 'odd-mob',
    artistName: 'ODD MOB',
    startTime: '18:00',
    endTime: '19:00',
    genreColor: '#3b82f6',
  }),
  perf({
    dateKey: 'jun14',
    artistId: 'eric-prydz',
    artistName: 'ERIC PRYDZ',
    startTime: '19:00',
    endTime: '20:20',
    genreColor: '#60a5fa',
  }),
  perf({
    dateKey: 'jun14',
    artistId: 'illenium',
    artistName: 'ILLENIUM',
    startTime: '20:20',
    endTime: '22:00',
    genreColor: '#7b61ff',
  }),
];

const DEMO_FALLBACK_ARTIST_ID = 'illenium';

function isFestivalDay(dateKey: string, now: Date): boolean {
  const fest = FESTIVAL_DATE_BY_KEY[dateKey];
  if (!fest) return false;
  return (
    now.getFullYear() === fest.year &&
    now.getMonth() + 1 === fest.month &&
    now.getDate() === fest.day
  );
}

function nowMinutes(now: Date): number {
  return now.getHours() * 60 + now.getMinutes();
}

export function resolveCurrentStormPerformance(
  performances: StormFloorPerformance[],
  now = new Date(),
): StormFloorPerformance {
  const list = performances.length ? performances : STORM_FLOOR_MOCK_PERFORMANCES;
  const minutes = nowMinutes(now);

  const live = list.find(
    (p) =>
      isFestivalDay(p.dateKey, now) &&
      minutes >= p.startMinutes &&
      minutes < p.endMinutes,
  );
  if (live) return live;

  const upcomingToday = list
    .filter((p) => isFestivalDay(p.dateKey, now) && p.startMinutes > minutes)
    .sort((a, b) => a.startMinutes - b.startMinutes)[0];
  if (upcomingToday) return upcomingToday;

  return (
    list.find((p) => p.artistId === DEMO_FALLBACK_ARTIST_ID) ??
    list[list.length - 1] ??
    STORM_FLOOR_MOCK_PERFORMANCES[STORM_FLOOR_MOCK_PERFORMANCES.length - 1]
  );
}

export function formatStormPerformanceSlot(performance: StormFloorPerformance): string {
  return `${performance.startTime} – ${performance.endTime}`;
}
