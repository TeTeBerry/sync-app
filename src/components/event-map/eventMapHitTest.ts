import { EVENT_MAP_MARKERS, type EventMapMarker } from "./eventMapMarkers";
import { createIsometricProjection } from "./isometricProjection";
import {
  screenToContent,
  type EventMapViewport,
} from "./eventMapViewport";

function markerHitRadius(
  width: number,
  height: number,
  depthScale: number,
): number {
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
  const w = Math.max(1, width);
  const h = Math.max(1, height);
  const { x: contentX, y: contentY } = screenToContent(
    screenX,
    screenY,
    viewport,
  );
  const proj = createIsometricProjection(w, h);

  const sorted = [...EVENT_MAP_MARKERS].sort((a, b) => b.ny - a.ny);
  for (const marker of sorted) {
    const center = proj.projectNorm(marker.nx, marker.ny);
    const r = markerHitRadius(w, h, center.scale);
    const dx = contentX - center.x;
    const dy = contentY - center.y;
    if (dx * dx + dy * dy <= r * r) {
      return marker;
    }
  }
  return null;
}
