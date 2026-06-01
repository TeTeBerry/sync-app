import type { EventMapMarker } from './eventMapMarkers';
import { EVENT_MAP_MARKERS_HIT_TEST } from './eventMapPaint';
import { getMapWorldDimensions } from './eventMapWorld';
import { createIsometricProjection } from './isometricProjection';
import { screenToContent, type EventMapViewport } from './eventMapViewport';

function markerHitRadius(width: number, height: number, depthScale: number): number {
  return Math.max(16, Math.min(width, height) * 0.034) * depthScale + 8;
}

/**
 * Find topmost marker at screen touch (accounts for pan/zoom viewport).
 */
export function findMarkerAtScreen(
  screenX: number,
  screenY: number,
  width: number,
  height: number,
  viewport: EventMapViewport,
): EventMapMarker | null {
  const { worldW, worldH } = getMapWorldDimensions(width, height);
  const { x: contentX, y: contentY } = screenToContent(screenX, screenY, viewport);
  const proj = createIsometricProjection(worldW, worldH);

  for (const marker of EVENT_MAP_MARKERS_HIT_TEST) {
    const center = proj.projectNorm(marker.nx, marker.ny);
    const r = markerHitRadius(worldW, worldH, center.scale);
    const dx = contentX - center.x;
    const dy = contentY - center.y;
    if (dx * dx + dy * dy <= r * r) {
      return marker;
    }
  }
  return null;
}
