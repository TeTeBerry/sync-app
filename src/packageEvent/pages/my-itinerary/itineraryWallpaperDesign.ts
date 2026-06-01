/** Lock-screen wallpaper artboard — ratios from 390×844 design mock. */
export const WALLPAPER_DESIGN = {
  width: 390,
  height: 844,
  /** Top band reserved for system date + large clock (background only). */
  clockZoneRatio: 0.28,
  clockZoneMinPx: 235,
  /** Gap between clock band and title block. */
  headerGapAfterClockPx: 12,
  /** Itinerary list target end (extends toward footer when crowded). */
  contentBottomRatio: 0.68,
  /** Bottom band reserved for torch / camera / home indicator. */
  bottomSafeRatio: 0.13,
  bottomSafeMinPx: 96,
  /** Footer sits this far down within the bottom safe band. */
  footerLiftInSafeZone: 0.45,
} as const;

export function lockScreenInsets(height: number, s: number) {
  const clockZoneH = Math.max(
    WALLPAPER_DESIGN.clockZoneMinPx * s,
    Math.round(height * WALLPAPER_DESIGN.clockZoneRatio),
  );
  const bottomSafeH = Math.max(
    WALLPAPER_DESIGN.bottomSafeMinPx * s,
    Math.round(height * WALLPAPER_DESIGN.bottomSafeRatio),
  );
  const headerTop = clockZoneH + WALLPAPER_DESIGN.headerGapAfterClockPx * s;
  const footerBaseY =
    height - bottomSafeH + bottomSafeH * WALLPAPER_DESIGN.footerLiftInSafeZone;
  const designContentBottom = height * WALLPAPER_DESIGN.contentBottomRatio;
  const maxContentBottom = footerBaseY - 40 * s;

  return {
    clockZoneH,
    bottomSafeH,
    headerTop,
    designContentBottom,
    maxContentBottom,
    footerBaseY,
  };
}
