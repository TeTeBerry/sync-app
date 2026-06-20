import {
  formatClockTimeNative,
  formatMinutesAsClockNative,
  formatTimeAgoNative,
  parseClockToMinutesNative,
  parseIsoDate,
  type FormatTimeAgoOptions,
} from './dateTimeNative';

export type { FormatTimeAgoOptions };

/** Parse ISO or date string; returns null when invalid. */
export function parseDate(iso: string) {
  return parseIsoDate(iso);
}

export function formatClockTime(raw: string, maxFallbackLength = 32): string {
  return formatClockTimeNative(raw, maxFallbackLength);
}

export function parseClockToMinutes(time: string): number {
  return parseClockToMinutesNative(time);
}

export function formatMinutesAsClock(totalMinutes: number): string {
  return formatMinutesAsClockNative(totalMinutes);
}

export function formatTimeAgo(iso: string, options?: FormatTimeAgoOptions): string {
  return formatTimeAgoNative(iso, options);
}
