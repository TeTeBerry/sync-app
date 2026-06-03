/** 屏幕标记与导出共用的尺寸（尖角锚点在地图坐标点） */

export const VENUE_PIN_BUBBLE_PX = 28;
export const VENUE_PIN_BUBBLE_HALF_PX = VENUE_PIN_BUBBLE_PX / 2;
export const VENUE_PIN_LABEL_APPROX_PX = 22;
export const VENUE_PIN_GAP_PX = 4;

/** 锚点向上到标记顶部的总高度（标签 + 气泡，与 event-map.scss 一致） */
export function venuePinHeightAboveAnchor(): number {
  return VENUE_PIN_LABEL_APPROX_PX + VENUE_PIN_GAP_PX + VENUE_PIN_BUBBLE_PX;
}

/** 舞台坐标下是否点在标记可视区域内（锚点为气泡尖角） */
export function isPointInVenuePin(
  stageX: number,
  stageY: number,
  anchorX: number,
  anchorY: number,
): boolean {
  const halfW = 72;
  const top = anchorY - venuePinHeightAboveAnchor() - 6;
  const bottom = anchorY + 8;
  return (
    stageX >= anchorX - halfW &&
    stageX <= anchorX + halfW &&
    stageY >= top &&
    stageY <= bottom
  );
}
