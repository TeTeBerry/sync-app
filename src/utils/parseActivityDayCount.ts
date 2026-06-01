/** Mirror backend `parseActivityDayCount` for default form days. */
export function parseActivityDayCount(date?: string): number {
  const raw = date?.trim();
  if (!raw) return 2;

  const range = raw.match(/(\d{1,2})[./月](\d{1,2})\s*[-–~至]\s*(\d{1,2})/);
  if (range) {
    const start = Number(range[2]);
    const end = Number(range[3]);
    if (Number.isFinite(start) && Number.isFinite(end) && end >= start) {
      return Math.min(7, Math.max(1, end - start + 1));
    }
  }

  return 2;
}
