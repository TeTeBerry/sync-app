import type { MapProps } from '@tarojs/components';
import Taro from '@tarojs/taro';

type MapPoint = { latitude: number; longitude: number };

/** 腾讯位置服务 key（路线规划插件、地图 subkey） */
export function getTencentMapSubkey(): string | undefined {
  const key = process.env.TARO_APP_QQ_MAP_KEY?.trim();
  return key || undefined;
}

/** 路线规划插件可选样式，默认 1（标准地图） */
export function getTencentMapLayerStyle(): number {
  const raw = process.env.TARO_APP_QQ_MAP_LAYER_STYLE?.trim();
  if (!raw) return 1;
  const n = Number.parseInt(raw, 10);
  return Number.isFinite(n) ? n : 1;
}

/** 微信开发者工具不支持 moveToMapLocation，真机正常。 */
export function isWechatDevtoolsMapLimited(): boolean {
  if (process.env.TARO_ENV !== 'weapp') return false;
  try {
    return Taro.getSystemInfoSync().platform === 'devtools';
  } catch {
    return false;
  }
}

export function safeMapMoveToLocation(ctx: Taro.MapContext, coords?: MapPoint): void {
  if (isWechatDevtoolsMapLimited()) return;
  const task = coords ? ctx.moveToLocation(coords) : ctx.moveToLocation({});
  void Promise.resolve(task).catch(() => undefined);
}

export function safeMapIncludePoints(
  ctx: Taro.MapContext,
  options: { points: MapPoint[]; padding?: number[] },
): void {
  if (isWechatDevtoolsMapLimited()) return;
  void Promise.resolve(ctx.includePoints(options)).catch(() => undefined);
}

export const TENCENT_MAP_3D_SETTING: NonNullable<MapProps['setting']> = {
  enable3D: true,
  enableOverlooking: true,
  enableRotate: true,
  enableZoom: true,
  enableScroll: true,
  showCompass: false,
  skew: 40,
  rotate: 18,
};
