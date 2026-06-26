import { describe, expect, it } from 'vitest';
import {
  PLUR_ENTRY_COVER_DESIGN_HEIGHT_PX,
  PLUR_ENTRY_COVER_DESIGN_WIDTH_PX,
  PLUR_ENTRY_COVER_RENDERED_HEIGHT_PX,
  PLUR_ENTRY_VIEWPORT,
  PLUR_PEACE_ENTRY_COVER_KEY,
} from '@/constants/plurAssets';

describe('plurAssets', () => {
  it('exports the cloud storage key for the peace entry cover', () => {
    expect(PLUR_PEACE_ENTRY_COVER_KEY).toBe('static/plur/peace-entry-cover.jpg');
  });

  it('maps 540w cover art onto 390×844 design frame', () => {
    expect(PLUR_ENTRY_VIEWPORT).toEqual({ width: 390, height: 844 });
    expect(PLUR_ENTRY_COVER_DESIGN_WIDTH_PX).toBe(540);
    expect(PLUR_ENTRY_COVER_DESIGN_HEIGHT_PX).toBe(962);
    expect(PLUR_ENTRY_COVER_RENDERED_HEIGHT_PX).toBe(695);
  });
});
