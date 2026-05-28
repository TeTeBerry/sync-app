/** Canvas map viewport: pan (offset) + uniform zoom (scale). */

export const MAP_SCALE_MIN = 0.5;
export const MAP_SCALE_MAX = 2;

export type EventMapViewport = {
  offsetX: number;
  offsetY: number;
  scale: number;
};

export const DEFAULT_EVENT_MAP_VIEWPORT: EventMapViewport = {
  offsetX: 0,
  offsetY: 0,
  scale: 1,
};

export function clampMapScale(scale: number): number {
  return Math.max(MAP_SCALE_MIN, Math.min(MAP_SCALE_MAX, scale));
}

/** Screen (canvas CSS px) → content space before viewport transform. */
export function screenToContent(
  screenX: number,
  screenY: number,
  viewport: EventMapViewport,
): { x: number; y: number } {
  const scale = viewport.scale || 1;
  return {
    x: (screenX - viewport.offsetX) / scale,
    y: (screenY - viewport.offsetY) / scale,
  };
}

/** Content space → screen (canvas CSS px). */
export function contentToScreen(
  contentX: number,
  contentY: number,
  viewport: EventMapViewport,
): { x: number; y: number } {
  return {
    x: contentX * viewport.scale + viewport.offsetX,
    y: contentY * viewport.scale + viewport.offsetY,
  };
}

export function applyViewportTransform(
  ctx: CanvasRenderingContext2D,
  viewport: EventMapViewport,
) {
  ctx.translate(viewport.offsetX, viewport.offsetY);
  ctx.scale(viewport.scale, viewport.scale);
}

/**
 * Pinch zoom around a screen anchor; returns updated offset + scale.
 */
export function zoomViewportAtScreen(
  viewport: EventMapViewport,
  anchorScreenX: number,
  anchorScreenY: number,
  nextScale: number,
): EventMapViewport {
  const scale = clampMapScale(nextScale);
  const content = screenToContent(anchorScreenX, anchorScreenY, viewport);
  return {
    scale,
    offsetX: anchorScreenX - content.x * scale,
    offsetY: anchorScreenY - content.y * scale,
  };
}

export function panViewport(
  viewport: EventMapViewport,
  deltaX: number,
  deltaY: number,
): EventMapViewport {
  return {
    ...viewport,
    offsetX: viewport.offsetX + deltaX,
    offsetY: viewport.offsetY + deltaY,
  };
}
