/** Matches RollingGo flight sample lines merged into transport.lines. */
export function isTravelGuideFlightSampleLine(line: string): boolean {
  const trimmed = line.trim();
  if (/^去程 .+（.+）( · 返程 .+（.+）)? · 约 [¥$]/.test(trimmed)) {
    return true;
  }
  return (
    / · 约 [¥$][\d,]+(?:\/人|$)/.test(trimmed) && /(→|直飞|经停|中转)/.test(trimmed)
  );
}

export function filterTransportLinesForFlightOffers(
  lines: string[],
  flightOffers?: unknown[],
): string[] {
  if (!flightOffers?.length) return lines;
  return lines.filter((line) => !isTravelGuideFlightSampleLine(line));
}
