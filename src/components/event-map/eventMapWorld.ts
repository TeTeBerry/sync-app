import type { EventMapViewport } from "./eventMapViewport";
import { clampMapScale, MAP_SCALE_MIN } from "./eventMapViewport";

/**
 * 逻辑地图相对一屏的倍数（约 4× 屏宽高 ≈ 可拖动探索「附近 10km」量级区域）。
 * 非真实地理比例，仅控制可平移范围与网格覆盖面积。
 */
export const MAP_WORLD_SIZE_FACTOR = 4;

/** 风暴会场在逻辑世界中的归一化位置（与原先单屏布局一致） */
export const MAP_VENUE_NX = 0.54;
export const MAP_VENUE_NY = 0.44;

export type MapWorldDimensions = {
  cssW: number;
  cssH: number;
  worldW: number;
  worldH: number;
};

export function getMapWorldDimensions(cssW: number, cssH: number): MapWorldDimensions {
  const safeW = Math.max(1, cssW);
  const safeH = Math.max(1, cssH);
  return {
    cssW: safeW,
    cssH: safeH,
    worldW: safeW * MAP_WORLD_SIZE_FACTOR,
    worldH: safeH * MAP_WORLD_SIZE_FACTOR,
  };
}

/** 标志点固定在屏幕上的锚点（与默认视口下场馆居中一致） */
export function getVenueLandmarkScreenPosition(
  cssW: number,
  cssH: number,
): { x: number; y: number } {
  const w = Math.max(1, cssW);
  const h = Math.max(1, cssH);
  return { x: w / 2, y: h / 2 };
}

/** 初始视口：会场在屏幕中心 */
export function getDefaultEventMapViewport(
  cssW: number,
  cssH: number,
  scale = MAP_SCALE_MIN,
): EventMapViewport {
  const { cssW: w, cssH: h, worldW, worldH } = getMapWorldDimensions(cssW, cssH);
  const s = clampMapScale(scale);
  return {
    scale: s,
    offsetX: w / 2 - MAP_VENUE_NX * worldW * s,
    offsetY: h / 2 - MAP_VENUE_NY * worldH * s,
  };
}

/** 限制平移，避免拖出网格覆盖区 */
export function clampEventMapViewport(
  viewport: EventMapViewport,
  cssW: number,
  cssH: number,
): EventMapViewport {
  const { worldW, worldH } = getMapWorldDimensions(cssW, cssH);
  const scale = clampMapScale(viewport.scale);
  const margin = 56;

  const minOffsetX = cssW - worldW * scale - margin;
  const maxOffsetX = margin;
  const minOffsetY = cssH - worldH * scale - margin;
  const maxOffsetY = margin;

  return {
    scale,
    offsetX: Math.min(maxOffsetX, Math.max(minOffsetX, viewport.offsetX)),
    offsetY: Math.min(maxOffsetY, Math.max(minOffsetY, viewport.offsetY)),
  };
}
