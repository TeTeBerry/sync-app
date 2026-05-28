/**
 * Pure 2D isometric / skew projection with depth scaling (near-big, far-small).
 * Logical map coordinates stay in flat 2D; screen drawing uses project().
 * Hit tests in logical space use the same nx/ny math as before via unproject() or hitTestLogical().
 */

export type Point2 = { x: number; y: number };

export type ProjectedPoint = Point2 & {
  /** Depth scale applied at this logical Y (1 = nominal size). */
  scale: number;
};

export type IsometricProjectionConfig = {
  /** Map-space anchor (normalized 0–1). Skew is applied around this point. */
  anchorNx: number;
  anchorNy: number;
  /** X skew: px = lx + ly * skewX (≈0.5 ≈ 26.5°, use with compressY for ~45° tilt). */
  skewX: number;
  /** Y skew from X: py term += lx * skewY */
  skewY: number;
  /** Vertical compression after skew (isometric foreshortening). */
  compressY: number;
  /** Scale at top (far) of the map. */
  minDepthScale: number;
  /** Scale at bottom (near) of the map. */
  maxDepthScale: number;
};

export const DEFAULT_ISOMETRIC_CONFIG: IsometricProjectionConfig = {
  anchorNx: 0.5,
  anchorNy: 0.42,
  skewX: 0.5,
  skewY: -0.25,
  compressY: 0.55,
  minDepthScale: 0.78,
  maxDepthScale: 1.06,
};

const UNPROJECT_ITERATIONS = 6;

function clamp01(v: number): number {
  return Math.max(0, Math.min(1, v));
}

function depthScaleAt(
  logicalY: number,
  height: number,
  config: IsometricProjectionConfig,
): number {
  const t = clamp01(logicalY / height);
  return (
    config.minDepthScale + (config.maxDepthScale - config.minDepthScale) * t
  );
}

function skewDeterminant(config: IsometricProjectionConfig): number {
  return config.compressY - config.skewX * config.skewY;
}

function logicalToSkewed(
  lx: number,
  ly: number,
  config: IsometricProjectionConfig,
): Point2 {
  return {
    x: lx + ly * config.skewX,
    y: ly * config.compressY + lx * config.skewY,
  };
}

function skewedToLogical(
  px: number,
  py: number,
  config: IsometricProjectionConfig,
): Point2 {
  const det = skewDeterminant(config);
  return {
    x: (config.compressY * px - config.skewX * py) / det,
    y: (-config.skewY * px + py) / det,
  };
}

export type IsometricProjection = {
  width: number;
  height: number;
  config: IsometricProjectionConfig;
  anchorX: number;
  anchorY: number;
  /** Flat logical pixel → screen with depth scale. */
  project: (x: number, y: number) => ProjectedPoint;
  /** Normalized 0–1 → screen. */
  projectNorm: (nx: number, ny: number) => ProjectedPoint;
  /** Screen pixel → flat logical pixel (for canvas touch). */
  unproject: (screenX: number, screenY: number) => Point2;
  /** Screen → normalized 0–1. */
  unprojectNorm: (screenX: number, screenY: number) => Point2;
  depthScale: (logicalY: number) => number;
};

export function createIsometricProjection(
  width: number,
  height: number,
  config: IsometricProjectionConfig = DEFAULT_ISOMETRIC_CONFIG,
): IsometricProjection {
  const safeWidth = Math.max(1, width);
  const safeHeight = Math.max(1, height);
  const anchorX = config.anchorNx * safeWidth;
  const anchorY = config.anchorNy * safeHeight;

  function project(x: number, y: number): ProjectedPoint {
    const scale = depthScaleAt(y, safeHeight, config);
    const skewed = logicalToSkewed(x - anchorX, y - anchorY, config);
    return {
      x: anchorX + skewed.x * scale,
      y: anchorY + skewed.y * scale,
      scale,
    };
  }

  function unproject(screenX: number, screenY: number): Point2 {
    let logicalY = safeHeight * 0.5;
    let logicalX = safeWidth * 0.5;

    for (let i = 0; i < UNPROJECT_ITERATIONS; i++) {
      const scale = depthScaleAt(logicalY, safeHeight, config);
      const px = (screenX - anchorX) / scale;
      const py = (screenY - anchorY) / scale;
      const local = skewedToLogical(px, py, config);
      logicalX = anchorX + local.x;
      logicalY = anchorY + local.y;
    }

    return { x: logicalX, y: logicalY };
  }

  return {
    width: safeWidth,
    height: safeHeight,
    config,
    anchorX,
    anchorY,
    project,
    projectNorm: (nx, ny) => project(nx * safeWidth, ny * safeHeight),
    unproject,
    unprojectNorm: (screenX, screenY) => {
      const p = unproject(screenX, screenY);
      return { x: p.x / safeWidth, y: p.y / safeHeight };
    },
    depthScale: (logicalY) => depthScaleAt(logicalY, safeHeight, config),
  };
}

/** Project a logical axis-aligned rect to a screen quad (4 corners). */
export function projectRect(
  proj: IsometricProjection,
  x: number,
  y: number,
  w: number,
  h: number,
): [ProjectedPoint, ProjectedPoint, ProjectedPoint, ProjectedPoint] {
  return [
    proj.project(x, y),
    proj.project(x + w, y),
    proj.project(x + w, y + h),
    proj.project(x, y + h),
  ];
}

export function strokeProjectedLine(
  ctx: CanvasRenderingContext2D,
  proj: IsometricProjection,
  x1: number,
  y1: number,
  x2: number,
  y2: number,
) {
  const a = proj.project(x1, y1);
  const b = proj.project(x2, y2);
  ctx.beginPath();
  ctx.moveTo(a.x, a.y);
  ctx.lineTo(b.x, b.y);
  ctx.stroke();
}

export function fillProjectedQuad(
  ctx: CanvasRenderingContext2D,
  corners: [ProjectedPoint, ProjectedPoint, ProjectedPoint, ProjectedPoint],
) {
  ctx.beginPath();
  ctx.moveTo(corners[0].x, corners[0].y);
  ctx.lineTo(corners[1].x, corners[1].y);
  ctx.lineTo(corners[2].x, corners[2].y);
  ctx.lineTo(corners[3].x, corners[3].y);
  ctx.closePath();
  ctx.fill();
}

/**
 * Hit test in flat logical pixels — unchanged semantics for nx/ny marker positions.
 */
export function hitTestMarkerLogical(
  logicalX: number,
  logicalY: number,
  markerNx: number,
  markerNy: number,
  width: number,
  height: number,
  hitRadiusPx?: number,
): boolean {
  const cx = markerNx * width;
  const cy = markerNy * height;
  const r = hitRadiusPx ?? Math.max(16, Math.min(width, height) * 0.034);
  const dx = logicalX - cx;
  const dy = logicalY - cy;
  return dx * dx + dy * dy <= (r + 8) ** 2;
}

/** Hit test from screen touch: unproject then test in logical space. */
export function hitTestMarkerScreen(
  screenX: number,
  screenY: number,
  markerNx: number,
  markerNy: number,
  proj: IsometricProjection,
  hitRadiusPx?: number,
): boolean {
  const logical = proj.unproject(screenX, screenY);
  return hitTestMarkerLogical(
    logical.x,
    logical.y,
    markerNx,
    markerNy,
    proj.width,
    proj.height,
    hitRadiusPx,
  );
}
