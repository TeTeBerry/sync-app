import {
  EVENT_MAP_DEFAULT_TITLE,
  EVENT_MAP_MARKERS,
  markerAvatarUrl,
  type EventMapMarker,
} from "./eventMapMarkers";
import {
  createIsometricProjection,
  projectRect,
  type IsometricProjection,
  type ProjectedPoint,
} from "./isometricProjection";
import {
  applyViewportTransform,
  DEFAULT_EVENT_MAP_VIEWPORT,
  type EventMapViewport,
} from "./eventMapViewport";
import { decodeRouteQueryParam } from "../../utils/route";
import {
  drawOfficialStormLogoSlowRotateSafe,
  drawOfficialStormLogoStaticSafe,
  stormLogoBottomOffset,
} from "./eventMapStormLogo";
import { getMapWorldDimensions, MAP_VENUE_NX, MAP_VENUE_NY } from "./eventMapWorld";
import { getMapAvatarBaseRadius, getStormLogoHalfSize, MAP_VENUE_PILL_GAP } from "./eventMapLayout";
import { createMapOffscreenCanvas, isMapOffscreenSupported } from "./mapOffscreenCanvas";

export const EVENT_MAP_BG = "#0e0b16";
const BG = EVENT_MAP_BG;
const BLOCK = "#1b1429";
const GRID = "rgba(140, 120, 180, 0.12)";
const STREET = "rgba(160, 150, 190, 0.35)";
const CONNECTOR = "rgba(167, 139, 250, 0.75)";

type CanvasImageSource = Parameters<CanvasRenderingContext2D["drawImage"]>[0];

const VENUE_NY = 0.44;
const MARKERS_BY_DEPTH = Object.freeze([...EVENT_MAP_MARKERS].sort((a, b) => a.ny - b.ny));

/** 点击检测：深度大的（靠前）优先 */
export const EVENT_MAP_MARKERS_HIT_TEST = Object.freeze([...MARKERS_BY_DEPTH].reverse());

const CITY_BLOCKS: Array<{ x: number; y: number; w: number; h: number }> = [
  { x: 0.05, y: 0.18, w: 0.22, h: 0.14 },
  { x: 0.08, y: 0.34, w: 0.18, h: 0.12 },
  { x: 0.32, y: 0.2, w: 0.2, h: 0.16 },
  { x: 0.55, y: 0.15, w: 0.28, h: 0.12 },
  { x: 0.58, y: 0.3, w: 0.24, h: 0.14 },
  { x: 0.12, y: 0.52, w: 0.16, h: 0.1 },
  { x: 0.35, y: 0.48, w: 0.22, h: 0.12 },
  { x: 0.62, y: 0.48, w: 0.2, h: 0.1 },
  { x: 0.05, y: 0.66, w: 0.25, h: 0.14 },
  { x: 0.38, y: 0.64, w: 0.18, h: 0.12 },
  { x: 0.62, y: 0.66, w: 0.3, h: 0.14 },
  /* 扩展外围街区，撑满更大逻辑地图 */
  { x: 0.02, y: 0.06, w: 0.14, h: 0.1 },
  { x: 0.78, y: 0.08, w: 0.16, h: 0.11 },
  { x: 0.82, y: 0.28, w: 0.14, h: 0.12 },
  { x: 0.04, y: 0.42, w: 0.12, h: 0.1 },
  { x: 0.76, y: 0.52, w: 0.18, h: 0.11 },
  { x: 0.18, y: 0.78, w: 0.2, h: 0.12 },
  { x: 0.52, y: 0.82, w: 0.22, h: 0.1 },
  { x: 0.8, y: 0.74, w: 0.15, h: 0.12 },
  { x: 0.06, y: 0.82, w: 0.16, h: 0.1 },
];

function normalizeEventTitle(raw: string): string {
  const decoded = decodeRouteQueryParam(raw) || raw.trim();
  if (!decoded || /%[0-9A-Fa-f]{2}/.test(decoded)) {
    return EVENT_MAP_DEFAULT_TITLE;
  }
  return decoded;
}

function drawGrid(ctx: CanvasRenderingContext2D, proj: IsometricProjection) {
  const { width: w, height: h } = proj;
  const step = Math.max(28, Math.round(Math.min(w, h) / 18));
  const pad = step * 2;
  ctx.beginPath();
  for (let x = -pad; x <= w + pad; x += step) {
    const a = proj.project(x, 0);
    const b = proj.project(x, h);
    ctx.moveTo(a.x, a.y);
    ctx.lineTo(b.x, b.y);
  }
  for (let y = -pad; y <= h + pad; y += step) {
    const a = proj.project(0, y);
    const b = proj.project(w, y);
    ctx.moveTo(a.x, a.y);
    ctx.lineTo(b.x, b.y);
  }
  ctx.strokeStyle = GRID;
  ctx.lineWidth = 1;
  ctx.stroke();
}

function drawBlocks(ctx: CanvasRenderingContext2D, proj: IsometricProjection) {
  const { width: w, height: h } = proj;
  ctx.beginPath();
  for (const b of CITY_BLOCKS) {
    const [c0, c1, c2, c3] = projectRect(proj, b.x * w, b.y * h, b.w * w, b.h * h);
    ctx.moveTo(c0.x, c0.y);
    ctx.lineTo(c1.x, c1.y);
    ctx.lineTo(c2.x, c2.y);
    ctx.lineTo(c3.x, c3.y);
    ctx.closePath();
  }
  ctx.fillStyle = BLOCK;
  ctx.fill();
}

function drawProjectedText(
  ctx: CanvasRenderingContext2D,
  text: string,
  anchor: ProjectedPoint,
  options: {
    font: string;
    fillStyle: string;
    textAlign?: CanvasTextAlign;
    textBaseline?: CanvasTextBaseline;
    rotateRad?: number;
  },
) {
  ctx.save();
  ctx.translate(anchor.x, anchor.y);
  ctx.scale(anchor.scale, anchor.scale);
  if (options.rotateRad) {
    ctx.rotate(options.rotateRad);
  }
  ctx.font = options.font;
  ctx.fillStyle = options.fillStyle;
  ctx.textAlign = options.textAlign ?? "center";
  ctx.textBaseline = options.textBaseline ?? "middle";
  ctx.fillText(text, 0, 0);
  ctx.restore();
}

function drawStreetLabels(ctx: CanvasRenderingContext2D, proj: IsometricProjection) {
  const { width: w, height: h } = proj;
  const font = "600 10px -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif";

  drawProjectedText(ctx, "NW 12TH AVE", proj.project(w * 0.1, h * 0.42), {
    font,
    fillStyle: STREET,
    rotateRad: -Math.PI / 2,
  });
  drawProjectedText(ctx, "NE 11TH ST", proj.project(w * 0.72, h * 0.72), {
    font,
    fillStyle: STREET,
  });
  drawProjectedText(ctx, "NE 10TH ST", proj.project(w * 0.5, h * 0.88), {
    font,
    fillStyle: STREET,
  });
  drawProjectedText(ctx, "E 8TH AVE", proj.project(w * 0.88, h * 0.38), {
    font,
    fillStyle: STREET,
    rotateRad: -Math.PI / 2,
  });
  drawProjectedText(ctx, "W 9TH AVE", proj.project(w * 0.06, h * 0.58), {
    font,
    fillStyle: STREET,
    rotateRad: -Math.PI / 2,
  });
}

function roundRect(
  ctx: CanvasRenderingContext2D,
  x: number,
  y: number,
  w: number,
  h: number,
  r: number,
) {
  const radius = Math.min(r, w / 2, h / 2);
  if (radius <= 0 || w <= 0 || h <= 0 || typeof ctx.arcTo !== "function") {
    ctx.beginPath();
    ctx.rect(x, y, w, h);
    ctx.closePath();
    return;
  }
  ctx.beginPath();
  ctx.moveTo(x + radius, y);
  ctx.arcTo(x + w, y, x + w, y + h, radius);
  ctx.arcTo(x + w, y + h, x, y + h, radius);
  ctx.arcTo(x, y + h, x, y, radius);
  ctx.arcTo(x, y, x + w, y, radius);
  ctx.closePath();
}

function drawStar(ctx: CanvasRenderingContext2D, cx: number, cy: number, size: number) {
  ctx.beginPath();
  for (let i = 0; i < 4; i++) {
    const a = (Math.PI / 2) * i - Math.PI / 4;
    const x1 = cx + Math.cos(a) * size;
    const y1 = cy + Math.sin(a) * size;
    const a2 = a + Math.PI / 4;
    const x2 = cx + Math.cos(a2) * (size * 0.35);
    const y2 = cy + Math.sin(a2) * (size * 0.35);
    if (i === 0) {
      ctx.moveTo(x1, y1);
    } else {
      ctx.lineTo(x1, y1);
    }
    ctx.lineTo(x2, y2);
  }
  ctx.closePath();
  ctx.fill();
}

function getStormVenueCenter(proj: IsometricProjection, stormLogo?: CanvasImageSource | null) {
  const { width: w, height: h } = proj;
  const center = proj.projectNorm(MAP_VENUE_NX, MAP_VENUE_NY);
  const iconSize = getStormLogoHalfSize(w, h, center.scale);
  return {
    w,
    h,
    center,
    cx: center.x,
    cy: center.y,
    iconSize,
    iconBottomY: center.y + stormLogoBottomOffset(iconSize, stormLogo),
  };
}

function getStormVenueLayout(
  proj: IsometricProjection,
  eventTitle: string,
  stormLogo?: CanvasImageSource | null,
) {
  return {
    ...getStormVenueCenter(proj, stormLogo),
    label: normalizeEventTitle(eventTitle),
  };
}

/** 会场静态装饰：连接线 + 标题 pill */
function drawStormVenueDecor(
  ctx: CanvasRenderingContext2D,
  proj: IsometricProjection,
  eventTitle: string,
  stormLogo?: CanvasImageSource | null,
) {
  const { w, center, label, cx, iconBottomY } = getStormVenueLayout(proj, eventTitle, stormLogo);
  const pillY = iconBottomY + MAP_VENUE_PILL_GAP * center.scale;
  ctx.font = "600 11px -apple-system, BlinkMacSystemFont, 'PingFang SC', sans-serif";
  const textW = ctx.measureText(label).width;
  const pillW = Math.min(w * 0.72, textW + 52);

  ctx.strokeStyle = CONNECTOR;
  ctx.lineWidth = 1.5;
  ctx.beginPath();
  ctx.moveTo(cx, iconBottomY);
  ctx.lineTo(cx, pillY);
  ctx.stroke();

  ctx.save();
  ctx.translate(cx, pillY);
  ctx.scale(center.scale, center.scale);
  ctx.fillStyle = "rgba(12, 8, 20, 0.92)";
  roundRect(ctx, -pillW / 2, 0, pillW, 26, 13);
  ctx.fill();
  ctx.fillStyle = "#ffffff";
  ctx.textAlign = "center";
  ctx.textBaseline = "middle";
  ctx.fillText(label, -8, 13);
  ctx.fillStyle = "#ff2d6a";
  drawStar(ctx, pillW / 2 - 18, 13, 5);
  ctx.restore();
}

/** 会场 LOGO：静态光晕 + 慢速 360° 旋转 */
function drawStormVenueLogo(
  ctx: CanvasRenderingContext2D,
  proj: IsometricProjection,
  time: number,
  stormLogo: CanvasImageSource | null | undefined,
) {
  const { cx, cy, iconSize } = getStormVenueCenter(proj, stormLogo);
  drawOfficialStormLogoSlowRotateSafe(ctx, cx, cy, iconSize, time, stormLogo);
}

/** 会场 LOGO：世界坐标固定（拖拽/平移时不旋转） */
function drawStormVenueLogoStatic(
  ctx: CanvasRenderingContext2D,
  proj: IsometricProjection,
  stormLogo: CanvasImageSource | null | undefined,
) {
  const { cx, cy, iconSize } = getStormVenueCenter(proj, stormLogo);
  drawOfficialStormLogoStaticSafe(ctx, cx, cy, iconSize, stormLogo);
}

function drawStormVenue(
  ctx: CanvasRenderingContext2D,
  proj: IsometricProjection,
  eventTitle: string,
  time: number,
  stormLogo: CanvasImageSource | null | undefined,
) {
  drawStormVenueLogo(ctx, proj, time, stormLogo);
  drawStormVenueDecor(ctx, proj, eventTitle, stormLogo);
}

/** 世界坐标静态 LOGO（随视口平移，idle 旋转层之外的拖拽路径） */
export function paintEventMapStormLogoLayerStatic(
  ctx: CanvasRenderingContext2D,
  width: number,
  height: number,
  mapViewport: EventMapViewport,
  stormLogo: CanvasImageSource | null | undefined,
) {
  if (!stormLogo) {
    return;
  }
  const proj = getProjection(width, height);
  ctx.save();
  applyViewportTransform(ctx, mapViewport);
  drawStormVenueLogoStatic(ctx, proj, stormLogo);
  ctx.restore();
}

/** 仅绘制旋转 LOGO 层（叠在场景缓存 blit 之上，随地图平移） */
export function paintEventMapStormLogoLayer(
  ctx: CanvasRenderingContext2D,
  width: number,
  height: number,
  mapViewport: EventMapViewport,
  time: number,
  stormLogo: CanvasImageSource | null | undefined,
) {
  if (!stormLogo) {
    return;
  }
  const proj = getProjection(width, height);
  ctx.save();
  applyViewportTransform(ctx, mapViewport);
  drawStormVenueLogo(ctx, proj, time, stormLogo);
  ctx.restore();
}

function drawAvatarMarker(
  ctx: CanvasRenderingContext2D,
  proj: IsometricProjection,
  marker: EventMapMarker,
  avatars: Map<string, CanvasImageSource>,
) {
  const { width: w, height: h } = proj;
  const center = proj.projectNorm(marker.nx, marker.ny);
  const baseR = getMapAvatarBaseRadius(w, h);
  const r = baseR * center.scale;
  const cx = center.x;
  const cy = center.y;
  const avatarSrc = markerAvatarUrl(marker.avatarSeed);
  const avatarImg = avatars.get(avatarSrc);

  ctx.strokeStyle = marker.ring;
  ctx.lineWidth = 2.5;
  ctx.beginPath();
  ctx.arc(cx, cy, r + 2, 0, Math.PI * 2);
  ctx.stroke();

  ctx.save();
  ctx.beginPath();
  ctx.arc(cx, cy, r, 0, Math.PI * 2);
  ctx.clip();

  if (avatarImg) {
    ctx.drawImage(avatarImg, cx - r, cy - r, r * 2, r * 2);
  } else {
    ctx.fillStyle = "#1a1528";
    ctx.fillRect(cx - r, cy - r, r * 2, r * 2);
    ctx.fillStyle = "#f0eef5";
    ctx.font = `700 ${Math.round(r * 0.72)}px -apple-system, BlinkMacSystemFont, sans-serif`;
    ctx.textAlign = "center";
    ctx.textBaseline = "middle";
    ctx.fillText(marker.name.charAt(0), cx, cy + 1);
  }
  ctx.restore();

  if (marker.star) {
    ctx.fillStyle = "#ff2d6a";
    drawStar(ctx, cx + r * 0.75, cy - r * 0.75, 4 * center.scale);
  }

  if (marker.badge) {
    ctx.save();
    ctx.translate(cx, cy);
    ctx.scale(center.scale, center.scale);
    ctx.font = "600 9px 'PingFang SC', -apple-system, sans-serif";
    const tw = ctx.measureText(marker.badge).width;
    const pillW = tw + 14;
    const pillH = 18;
    const pillX = marker.badge === "组队中" ? -pillW / 2 : -pillW / 2 + 10;
    const pillY = marker.badge === "组队中" ? -baseR - 24 : baseR + 6;
    ctx.fillStyle = "rgba(12, 8, 20, 0.9)";
    roundRect(ctx, pillX, pillY, pillW, pillH, 9);
    ctx.fill();
    ctx.fillStyle = "#ffffff";
    ctx.textAlign = "center";
    ctx.textBaseline = "middle";
    ctx.fillText(marker.badge, pillX + pillW / 2, pillY + pillH / 2);
    ctx.restore();
  }

  const nameOffset = marker.badge === "等待队友" ? 28 : marker.badge === "组队中" ? 18 : 16;
  drawProjectedText(
    ctx,
    marker.name,
    proj.project(marker.nx * w, marker.ny * h + baseR + nameOffset),
    {
      font: "600 10px -apple-system, BlinkMacSystemFont, sans-serif",
      fillStyle: "#ffffff",
      textBaseline: "alphabetic",
    },
  );
}

const projectionCache = new Map<string, IsometricProjection>();

/** css 画布尺寸 → 逻辑世界投影（更大可拖动区域） */
function getProjection(cssW: number, cssH: number): IsometricProjection {
  const { worldW, worldH } = getMapWorldDimensions(cssW, cssH);
  const w = worldW;
  const h = worldH;
  const key = `${w}x${h}`;
  let proj = projectionCache.get(key);
  if (!proj) {
    proj = createIsometricProjection(w, h);
    projectionCache.set(key, proj);
    if (projectionCache.size > 6) {
      const oldest = projectionCache.keys().next().value;
      if (oldest) {
        projectionCache.delete(oldest);
      }
    }
  }
  return proj;
}

type TerrainCacheEntry = {
  key: string;
  canvas: HTMLCanvasElement;
};

let terrainCache: TerrainCacheEntry | null = null;
let terrainCacheSupported: boolean | null = null;

function isTerrainCacheSupported(): boolean {
  // 小程序主画布直接绘制地形，离屏地形缓存易与场景缓存叠加导致异常
  return false;
}

function paintTerrainOffscreenLayers(ctx: CanvasRenderingContext2D, cssW: number, cssH: number) {
  const proj = getProjection(cssW, cssH);
  drawGrid(ctx, proj);
  drawBlocks(ctx, proj);
  drawStreetLabels(ctx, proj);
}

function blitCachedTerrain(ctx: CanvasRenderingContext2D, cssW: number, cssH: number): boolean {
  if (!isTerrainCacheSupported()) {
    return false;
  }

  const { worldW, worldH } = getMapWorldDimensions(cssW, cssH);
  const key = `${worldW}x${worldH}`;
  if (!terrainCache || terrainCache.key !== key) {
    const offscreen = createMapOffscreenCanvas(worldW, worldH);
    if (!offscreen) {
      terrainCacheSupported = false;
      terrainCache = null;
      return false;
    }
    const offCtx = offscreen.getContext("2d");
    if (!offCtx) {
      return false;
    }
    paintTerrainOffscreenLayers(offCtx, cssW, cssH);
    terrainCache = { key, canvas: offscreen };
  }

  try {
    ctx.drawImage(terrainCache.canvas, 0, 0, worldW, worldH);
    return true;
  } catch {
    terrainCache = null;
    terrainCacheSupported = false;
    return false;
  }
}

export function invalidateEventMapTerrainCache() {
  terrainCache = null;
  terrainCacheSupported = null;
}

function paintMapTerrain(ctx: CanvasRenderingContext2D, cssW: number, cssH: number) {
  const proj = getProjection(cssW, cssH);
  if (!blitCachedTerrain(ctx, cssW, cssH)) {
    drawGrid(ctx, proj);
    drawBlocks(ctx, proj);
    drawStreetLabels(ctx, proj);
  }
}

function paintMarkersBeforeVenue(
  ctx: CanvasRenderingContext2D,
  width: number,
  height: number,
  avatars: Map<string, CanvasImageSource>,
) {
  const proj = getProjection(width, height);
  for (const marker of MARKERS_BY_DEPTH) {
    if (marker.ny >= VENUE_NY) {
      break;
    }
    drawAvatarMarker(ctx, proj, marker, avatars);
  }
}

function paintMarkersAfterVenue(
  ctx: CanvasRenderingContext2D,
  width: number,
  height: number,
  avatars: Map<string, CanvasImageSource>,
) {
  const proj = getProjection(width, height);
  for (const marker of MARKERS_BY_DEPTH) {
    if (marker.ny >= VENUE_NY) {
      drawAvatarMarker(ctx, proj, marker, avatars);
    }
  }
}

/** 静态场景（地形 + 标记 + 会场装饰），写入离屏缓存 */
export function paintEventMapScene(
  ctx: CanvasRenderingContext2D,
  width: number,
  height: number,
  eventTitle: string,
  avatars: Map<string, CanvasImageSource>,
  mapViewport: EventMapViewport,
  stormLogo?: CanvasImageSource | null,
) {
  const { worldW, worldH } = getMapWorldDimensions(width, height);

  ctx.fillStyle = BG;
  ctx.fillRect(0, 0, worldW, worldH);

  ctx.save();
  applyViewportTransform(ctx, mapViewport);
  paintMapTerrain(ctx, width, height);
  paintMarkersBeforeVenue(ctx, width, height, avatars);
  ctx.restore();
}

/** 会场标题装饰（在 LOGO 之上） */
export function paintEventMapDecorLayer(
  ctx: CanvasRenderingContext2D,
  width: number,
  height: number,
  eventTitle: string,
  mapViewport: EventMapViewport,
  stormLogo: CanvasImageSource | null | undefined,
) {
  const proj = getProjection(width, height);
  ctx.save();
  applyViewportTransform(ctx, mapViewport);
  drawStormVenueDecor(ctx, proj, eventTitle, stormLogo);
  ctx.restore();
}

/** 会场后方用户标记（须在 LOGO / 装饰层之后绘制） */
export function paintEventMapMarkersAfterVenueLayer(
  ctx: CanvasRenderingContext2D,
  width: number,
  height: number,
  avatars: Map<string, CanvasImageSource>,
  mapViewport: EventMapViewport,
) {
  ctx.save();
  applyViewportTransform(ctx, mapViewport);
  paintMarkersAfterVenue(ctx, width, height, avatars);
  ctx.restore();
}

/** 最小可绘制帧（无 drawImage），用于主绘制失败时的兜底 */
export function paintEventMapMinimal(ctx: CanvasRenderingContext2D, width: number, height: number) {
  ctx.fillStyle = BG;
  ctx.fillRect(0, 0, width, height);
  paintMapTerrain(ctx, width, height);
}

export function paintEventMap(
  ctx: CanvasRenderingContext2D,
  width: number,
  height: number,
  eventTitle: string,
  avatars: Map<string, CanvasImageSource>,
  mapViewport: EventMapViewport = DEFAULT_EVENT_MAP_VIEWPORT,
  time: number = Date.now(),
  stormLogo: CanvasImageSource | null | undefined = null,
  /** 拖拽/缩放中不绘制 LOGO */
  gestureLite = false,
) {
  const proj = getProjection(width, height);

  ctx.fillStyle = BG;
  ctx.fillRect(0, 0, width, height);

  ctx.save();
  applyViewportTransform(ctx, mapViewport);
  paintMapTerrain(ctx, width, height);
  paintMarkersBeforeVenue(ctx, width, height, avatars);
  if (gestureLite) {
    drawStormVenueLogoStatic(ctx, proj, stormLogo);
    drawStormVenueDecor(ctx, proj, eventTitle, stormLogo);
  } else {
    drawStormVenue(ctx, proj, eventTitle, time, stormLogo);
  }
  paintMarkersAfterVenue(ctx, width, height, avatars);
  ctx.restore();
}
