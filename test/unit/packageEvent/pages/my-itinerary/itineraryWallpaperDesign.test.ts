import { describe, expect, it } from 'vitest';
import {
  lockScreenInsets,
  WALLPAPER_DESIGN,
} from '@/packageEvent/pages/my-itinerary/itineraryWallpaperDesign';

describe('lockScreenInsets', () => {
  const height = 2340;
  const s = height / WALLPAPER_DESIGN.height;

  it('respects minimum clock and bottom safe bands', () => {
    const insets = lockScreenInsets(height, s);

    expect(insets.clockZoneH).toBeGreaterThanOrEqual(
      WALLPAPER_DESIGN.clockZoneMinPx * s,
    );
    expect(insets.bottomSafeH).toBeGreaterThanOrEqual(
      WALLPAPER_DESIGN.bottomSafeMinPx * s,
    );
  });

  it('places header below clock band and caps content above footer', () => {
    const insets = lockScreenInsets(height, s);

    expect(insets.headerTop).toBeGreaterThan(insets.clockZoneH);
    expect(insets.maxContentBottom).toBeLessThan(insets.footerBaseY);
    expect(insets.designContentBottom).toBeCloseTo(
      height * WALLPAPER_DESIGN.contentBottomRatio,
      0,
    );
  });
});
