import Taro from "@tarojs/taro";

/**
 * 活动地图视觉比例（头像为基准，会场 LOGO 略大但不压屏）
 */

/** 底部头像栏内容区高度（不含 safe-area），与 event-map.scss 对齐 */
export const EVENT_MAP_BOTTOM_BAR_CONTENT_PX = 100;

/** 顶栏内容区高度（不含状态栏 paddingTop），与 event-map.scss 对齐 */
export const EVENT_MAP_TOP_BAR_CONTENT_PX = 46;

/** Canvas 可用高度 = 窗口 − 顶栏 − 底栏（控件须在 Canvas 外，否则微信端点不到） */
export function getEventMapMapViewportHeight(
  windowHeight?: number,
  topChromePx?: number,
): number {
  const info = Taro.getWindowInfo();
  const h = windowHeight ?? info.windowHeight ?? 667;
  const safeBottom = info.safeArea ? Math.max(0, h - info.safeArea.bottom) : 0;
  const top =
    topChromePx ?? EVENT_MAP_TOP_BAR_CONTENT_PX + (info.statusBarHeight ?? 44);
  return Math.max(1, h - top - EVENT_MAP_BOTTOM_BAR_CONTENT_PX - safeBottom);
}

/** 头像半径：相对地图短边 */
export const MAP_AVATAR_R_RATIO = 0.034;
export const MAP_AVATAR_R_MIN = 16;

/** 会场 LOGO 可视高度比同深度头像直径多出的像素 */
export const MAP_VENUE_LOGO_EXTRA_PX = 14;

/** PNG 透明留白裁剪（仅影响绘制，不改变动画） */
export const MAP_STORM_LOGO_CONTENT_TRIM = 0.9;

/** 呼吸光晕外圈比图标外接圆半径多出的像素（图标始终在圆心） */
export const MAP_STORM_LOGO_GLOW_EXTRA_PX = 2;

/**
 * storm-logo.png 可视 Y 形中心（相对整张位图 0–1，0.5 为几何中心）。
 * 透明留白偏多时需微调，使图标落在呼吸光晕正中心。
 */
export const MAP_STORM_LOGO_VISUAL_CENTER_NX = 0.5;
export const MAP_STORM_LOGO_VISUAL_CENTER_NY = 0.35;

/** 标题 pill 与 LOGO 底间距（内容坐标，会乘 depth scale） */
export const MAP_VENUE_PILL_GAP = 10;

export function getMapAvatarBaseRadius(
  mapWidth: number,
  mapHeight: number,
): number {
  return Math.max(
    MAP_AVATAR_R_MIN,
    Math.min(mapWidth, mapHeight) * MAP_AVATAR_R_RATIO,
  );
}

/** LOGO 半高（传入 drawOfficialStormLogo 的 size；宽度按原图比例） */
export function getStormLogoHalfSize(
  mapWidth: number,
  mapHeight: number,
  depthScale: number,
): number {
  const avatarR = getMapAvatarBaseRadius(mapWidth, mapHeight);
  const avatarDiameter = avatarR * depthScale * 2;
  const logoHeight = avatarDiameter + MAP_VENUE_LOGO_EXTRA_PX;
  return logoHeight / (2 * MAP_STORM_LOGO_CONTENT_TRIM);
}
