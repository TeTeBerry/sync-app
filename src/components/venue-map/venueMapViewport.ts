/** 场馆图平移缩放（屏幕 CSS px ↔ 内容坐标） */

import { venueMapRegionHeightPx, venueMapRegionTopPx } from './venueMapRegion';

export const VENUE_MAP_SCALE_MIN = 0.45;
export const VENUE_MAP_SCALE_MAX = 3;
export const VENUE_MAP_ZOOM_BUTTON_FACTOR = 1.22;

export type VenueMapViewport = {
  offsetX: number;
  offsetY: number;
  scale: number;
};

export function clampVenueMapScale(scale: number): number {
  return Math.max(VENUE_MAP_SCALE_MIN, Math.min(VENUE_MAP_SCALE_MAX, scale));
}

export function screenToContent(
  screenX: number,
  screenY: number,
  viewport: VenueMapViewport,
): { x: number; y: number } {
  const scale = viewport.scale || 1;
  return {
    x: (screenX - viewport.offsetX) / scale,
    y: (screenY - viewport.offsetY) / scale,
  };
}

export function contentToScreen(
  contentX: number,
  contentY: number,
  viewport: VenueMapViewport,
): { x: number; y: number } {
  return {
    x: contentX * viewport.scale + viewport.offsetX,
    y: contentY * viewport.scale + viewport.offsetY,
  };
}

export function zoomViewportAtScreen(
  viewport: VenueMapViewport,
  anchorScreenX: number,
  anchorScreenY: number,
  nextScale: number,
): VenueMapViewport {
  const scale = clampVenueMapScale(nextScale);
  const content = screenToContent(anchorScreenX, anchorScreenY, viewport);
  return {
    scale,
    offsetX: anchorScreenX - content.x * scale,
    offsetY: anchorScreenY - content.y * scale,
  };
}

export function panViewport(
  viewport: VenueMapViewport,
  deltaX: number,
  deltaY: number,
): VenueMapViewport {
  return {
    ...viewport,
    offsetX: viewport.offsetX + deltaX,
    offsetY: viewport.offsetY + deltaY,
  };
}

export function stepVenueMapViewportZoom(
  viewport: VenueMapViewport,
  direction: 'in' | 'out',
  anchorScreenX: number,
  anchorScreenY: number,
): VenueMapViewport {
  const factor =
    direction === 'in'
      ? VENUE_MAP_ZOOM_BUTTON_FACTOR
      : 1 / VENUE_MAP_ZOOM_BUTTON_FACTOR;
  return zoomViewportAtScreen(
    viewport,
    anchorScreenX,
    anchorScreenY,
    viewport.scale * factor,
  );
}

/** 初始视角：聚焦海报下半部分的区域分布图 */
export function initialVenueMapViewport(
  mapWidth: number,
  mapHeight: number,
  viewWidth: number,
  viewHeight: number,
): VenueMapViewport {
  const regionTop = venueMapRegionTopPx(mapHeight);
  const regionHeight = venueMapRegionHeightPx(mapHeight);
  const scale = clampVenueMapScale(
    Math.min(viewWidth / mapWidth, viewHeight / regionHeight) * 0.92,
  );
  const offsetX = (viewWidth - mapWidth * scale) / 2;
  const offsetY = (viewHeight - regionHeight * scale) / 2 - regionTop * scale;
  return constrainVenueMapViewport(
    { scale, offsetX, offsetY },
    mapWidth,
    mapHeight,
    viewWidth,
    viewHeight,
  );
}

/** 限制平移范围，避免地图被拖出视口只剩黑底 */
export function constrainVenueMapViewport(
  viewport: VenueMapViewport,
  mapWidth: number,
  mapHeight: number,
  viewWidth: number,
  viewHeight: number,
): VenueMapViewport {
  const scale = clampVenueMapScale(viewport.scale);
  const scaledW = mapWidth * scale;
  const scaledH = mapHeight * scale;
  const minVisible = 0.2;

  const minOffsetX = viewWidth * minVisible - scaledW;
  const maxOffsetX = viewWidth - scaledW * minVisible;
  const minOffsetY = viewHeight * minVisible - scaledH;
  const maxOffsetY = viewHeight - scaledH * minVisible;

  return {
    scale,
    offsetX: Math.min(maxOffsetX, Math.max(minOffsetX, viewport.offsetX)),
    offsetY: Math.min(maxOffsetY, Math.max(minOffsetY, viewport.offsetY)),
  };
}

/** 将原图像素尺寸换算为与屏幕一致的 CSS 布局尺寸 */
export function fitVenueMapDisplaySize(
  imageWidth: number,
  imageHeight: number,
  viewWidth: number,
): { width: number; height: number } {
  const safeW = Math.max(1, imageWidth);
  const safeViewW = Math.max(1, viewWidth);
  const width = safeViewW;
  const height = Math.round((imageHeight / safeW) * safeViewW);
  return { width, height: Math.max(1, height) };
}

export {
  clampMarkerNormalized,
  VENUE_MAP_REGION_TOP,
  VENUE_MAP_REGION_BOTTOM,
} from './venueMapRegion';
