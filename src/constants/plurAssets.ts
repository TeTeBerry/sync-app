/** CloudBase object keys under `static/plur/` (upload via sync-app-backend `npm run media:upload-plur`). */
export const PLUR_PEACE_ENTRY_COVER_KEY = 'static/plur/peace-entry-cover.jpg';

export const PLUR_SCENE_IMAGE_KEYS = {
  peace: 'static/plur/scenes/peace.jpg',
  love: 'static/plur/scenes/love.jpg',
  unity: 'static/plur/scenes/unity.jpg',
  respect: 'static/plur/scenes/respect.jpg',
} as const;

/** L1 design frame (logical px). */
export const PLUR_ENTRY_VIEWPORT = { width: 390, height: 844 } as const;

/** Peace 静帧 export width in design (@540w asset → 390w on device). */
export const PLUR_ENTRY_COVER_DESIGN_WIDTH_PX = 540;

/** Portrait 575×1024 source scaled to 540w. */
export const PLUR_ENTRY_COVER_SOURCE = { width: 575, height: 1024 } as const;

export const PLUR_ENTRY_COVER_DESIGN_HEIGHT_PX = Math.round(
  (PLUR_ENTRY_COVER_SOURCE.height * PLUR_ENTRY_COVER_DESIGN_WIDTH_PX) /
    PLUR_ENTRY_COVER_SOURCE.width,
);

/** Rendered image height on 390w viewport (widthFix). */
export const PLUR_ENTRY_COVER_RENDERED_HEIGHT_PX = Math.round(
  (PLUR_ENTRY_COVER_DESIGN_HEIGHT_PX * PLUR_ENTRY_VIEWPORT.width) /
    PLUR_ENTRY_COVER_DESIGN_WIDTH_PX,
);
