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

const BG = "#0e0b16";
const BLOCK = "#1b1429";
const GRID = "rgba(140, 120, 180, 0.12)";
const STREET = "rgba(160, 150, 190, 0.35)";
const STORM_GLOW = "rgba(157, 87, 255, 0.5)";
const CONNECTOR = "rgba(167, 139, 250, 0.75)";

type CanvasImageSource = Parameters<CanvasRenderingContext2D["drawImage"]>[0];

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
  const step = Math.max(28, Math.round(Math.min(w, h) / 14));
  ctx.beginPath();
  for (let x = 0; x <= w; x += step) {
    const a = proj.project(x, 0);
    const b = proj.project(x, h);
    ctx.moveTo(a.x, a.y);
    ctx.lineTo(b.x, b.y);
  }
  for (let y = 0; y <= h; y += step) {
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
    const [c0, c1, c2, c3] = projectRect(
      proj,
      b.x * w,
      b.y * h,
      b.w * w,
      b.h * h,
    );
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
  const font =
    "600 10px -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif";

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
}

function drawCompass(ctx: CanvasRenderingContext2D, w: number, _h: number) {
  const cx = w - 28;
  const cy = 72;
  ctx.fillStyle = "rgba(255,255,255,0.85)";
  ctx.font = "700 11px -apple-system, BlinkMacSystemFont, sans-serif";
  ctx.textAlign = "center";
  ctx.textBaseline = "middle";
  ctx.fillText("N", cx, cy);
  ctx.beginPath();
  ctx.moveTo(cx, cy - 14);
  ctx.lineTo(cx - 4, cy - 8);
  ctx.lineTo(cx + 4, cy - 8);
  ctx.closePath();
  ctx.fill();
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

function drawStar(
  ctx: CanvasRenderingContext2D,
  cx: number,
  cy: number,
  size: number,
) {
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

/** 绘制风暴电音节图标（中心坐标 x,y，大小 size） */
function drawStormIcon(
  ctx: CanvasRenderingContext2D,
  x: number,
  y: number,
  size: number,
) {
  ctx.save();
  ctx.translate(x, y);

  ctx.beginPath();
  ctx.moveTo(0, -size * 1.0);
  ctx.lineTo(-size * 0.9, size * 0.7);
  ctx.lineTo(size * 0.9, size * 0.7);
  ctx.closePath();
  try {
    const grd = ctx.createRadialGradient(0, 0, 0, 0, 0, size);
    grd.addColorStop(0, "#7a2ff8");
    grd.addColorStop(1, "#3f1c7a");
    ctx.fillStyle = grd;
  } catch {
    ctx.fillStyle = "#5b2bb8";
  }
  ctx.fill();

  ctx.beginPath();
  ctx.moveTo(0, -size * 0.5);
  ctx.lineTo(-size * 0.3, 0);
  ctx.lineTo(size * 0.2, 0);
  ctx.lineTo(-size * 0.2, size * 0.5);
  ctx.lineWidth = Math.max(2, size * 0.12);
  ctx.strokeStyle = "#ffffff";
  ctx.lineJoin = "round";
  ctx.stroke();

  ctx.restore();
}

/** 地图中心：风暴电音节会场（已移除原 Clubspace 金色圆标） */
function drawStormVenue(
  ctx: CanvasRenderingContext2D,
  proj: IsometricProjection,
  eventTitle: string,
) {
  const { width: w, height: h } = proj;
  const center = proj.project(w * 0.54, h * 0.44);
  const baseR = Math.min(w, h) * 0.11;
  const r = baseR * center.scale;
  const label = normalizeEventTitle(eventTitle);
  const cx = center.x;
  const cy = center.y;

  const iconSize = r * 0.92;
  const iconBottomY = cy + iconSize * 0.7;
  const glowR = Math.max(1, iconSize * 1.75);
  try {
    const glow = ctx.createRadialGradient(cx, cy, iconSize * 0.2, cx, cy, glowR);
    glow.addColorStop(0, STORM_GLOW);
    glow.addColorStop(1, "rgba(157, 87, 255, 0)");
    ctx.fillStyle = glow;
  } catch {
    ctx.fillStyle = STORM_GLOW;
  }
  ctx.beginPath();
  ctx.arc(cx, cy, glowR, 0, Math.PI * 2);
  ctx.fill();

  drawStormIcon(ctx, cx, cy, iconSize);

  const pillY = iconBottomY + 18 * center.scale;
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

function drawAvatarMarker(
  ctx: CanvasRenderingContext2D,
  proj: IsometricProjection,
  marker: EventMapMarker,
  avatars: Map<string, CanvasImageSource>,
) {
  const { width: w, height: h } = proj;
  const center = proj.projectNorm(marker.nx, marker.ny);
  const baseR = Math.max(16, Math.min(w, h) * 0.034);
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

  const nameOffset =
    marker.badge === "等待队友" ? 28 : marker.badge === "组队中" ? 18 : 16;
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

function getProjection(width: number, height: number): IsometricProjection {
  const w = Math.max(1, width);
  const h = Math.max(1, height);
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

export function paintEventMap(
  ctx: CanvasRenderingContext2D,
  width: number,
  height: number,
  eventTitle: string,
  avatars: Map<string, CanvasImageSource>,
  mapViewport: EventMapViewport = DEFAULT_EVENT_MAP_VIEWPORT,
) {
  const proj = getProjection(width, height);

  ctx.clearRect(0, 0, width, height);
  ctx.fillStyle = BG;
  ctx.fillRect(0, 0, width, height);

  ctx.save();
  applyViewportTransform(ctx, mapViewport);
  drawGrid(ctx, proj);
  drawBlocks(ctx, proj);
  drawStreetLabels(ctx, proj);

  const markersByDepth = [...EVENT_MAP_MARKERS].sort((a, b) => a.ny - b.ny);
  const venueNy = 0.44;
  for (const marker of markersByDepth) {
    if (marker.ny >= venueNy) {
      break;
    }
    drawAvatarMarker(ctx, proj, marker, avatars);
  }
  drawStormVenue(ctx, proj, eventTitle);
  for (const marker of markersByDepth) {
    if (marker.ny >= venueNy) {
      drawAvatarMarker(ctx, proj, marker, avatars);
    }
  }
  ctx.restore();

  drawCompass(ctx, width, height);
}
