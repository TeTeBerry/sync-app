const TRANSPORT_TIME_RANGE_PATTERN =
  /(\d{1,2}:\d{2})(?:\s*[-–—~至到]\s*(\d{1,2}:\d{2}))?/;

function normalizeClockTime(raw: string): string | undefined {
  const match = raw.trim().match(/^(\d{1,2}):(\d{2})$/);
  if (!match) {
    return undefined;
  }

  const hours = Number.parseInt(match[1], 10);
  const minutes = Number.parseInt(match[2], 10);
  if (hours > 23 || minutes > 59) {
    return undefined;
  }

  return `${String(hours).padStart(2, '0')}:${String(minutes).padStart(2, '0')}`;
}

export function parseTransportTimesFromText(text: string): {
  startTime?: string;
  endTime?: string;
} {
  const match = text.match(TRANSPORT_TIME_RANGE_PATTERN);
  if (!match) {
    return {};
  }

  const startTime = normalizeClockTime(match[1]);
  const endTime = match[2] ? normalizeClockTime(match[2]) : undefined;
  return {
    ...(startTime ? { startTime } : {}),
    ...(endTime ? { endTime } : {}),
  };
}
