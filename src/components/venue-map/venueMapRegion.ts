/** 海报中「区域分布图」在整图上的纵向范围（与 initialVenueMapViewport 一致） */

export const VENUE_MAP_REGION_TOP = 0.46;
export const VENUE_MAP_REGION_BOTTOM = 1;

export function venueMapRegionTopPx(mapHeight: number): number {
  return mapHeight * VENUE_MAP_REGION_TOP;
}

export function venueMapRegionHeightPx(mapHeight: number): number {
  return mapHeight * (VENUE_MAP_REGION_BOTTOM - VENUE_MAP_REGION_TOP);
}

/** 将整图归一化坐标 (nx, ny) 限制在区域分布图内 */
export function clampMarkerNormalized(
  nx: number,
  ny: number,
): { nx: number; ny: number } {
  const pad = 0.02 * (VENUE_MAP_REGION_BOTTOM - VENUE_MAP_REGION_TOP);
  const yMin = VENUE_MAP_REGION_TOP + pad;
  const yMax = VENUE_MAP_REGION_BOTTOM - pad;
  return {
    nx: Math.max(0.02, Math.min(0.98, nx)),
    ny: Math.max(yMin, Math.min(yMax, ny)),
  };
}

/** 标记点在整图上的像素坐标 */
export function markerContentPx(
  marker: { nx: number; ny: number },
  mapWidth: number,
  mapHeight: number,
): { x: number; y: number } {
  return {
    x: marker.nx * mapWidth,
    y: marker.ny * mapHeight,
  };
}

/** 导出裁剪图上的标记像素坐标 */
export function markerExportPx(
  marker: { nx: number; ny: number },
  srcWidth: number,
  srcHeight: number,
  exportWidth: number,
  exportHeight: number,
): { x: number; y: number } {
  const regionTop = venueMapRegionTopPx(srcHeight);
  const regionHeight = venueMapRegionHeightPx(srcHeight);
  const content = markerContentPx(marker, srcWidth, srcHeight);
  return {
    x: (content.x / srcWidth) * exportWidth,
    y: ((content.y - regionTop) / regionHeight) * exportHeight,
  };
}
