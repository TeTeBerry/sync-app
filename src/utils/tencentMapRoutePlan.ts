import Taro from '@tarojs/taro';
import {
  ensureUserLocationAuthorized,
  getTencentMapLayerStyle,
  getTencentMapSubkey,
} from './tencentMap';

export type TencentRoutePlanMode = 'driving' | 'walking';

export type TencentRoutePlanDestination = {
  name: string;
  latitude: number;
  longitude: number;
  address?: string;
};

export const TENCENT_ROUTE_PLAN_PLUGIN = 'route-plan';

const ROUTE_PLAN_REFERER = 'SYNC';

function buildRoutePlanEndPoint(destination: TencentRoutePlanDestination): string {
  return JSON.stringify({
    name: destination.name,
    latitude: destination.latitude,
    longitude: destination.longitude,
  });
}

function buildRoutePlanUrl(
  destination: TencentRoutePlanDestination,
  mode: TencentRoutePlanMode,
): string | null {
  const key = getTencentMapSubkey();
  if (!key) return null;

  const query = [
    `key=${encodeURIComponent(key)}`,
    `referer=${encodeURIComponent(ROUTE_PLAN_REFERER)}`,
    `endPoint=${encodeURIComponent(buildRoutePlanEndPoint(destination))}`,
    `mode=${mode}`,
    `navigation=1`,
    `enableAI=true`,
    `layerStyle=${getTencentMapLayerStyle()}`,
  ].join('&');

  return `plugin://${TENCENT_ROUTE_PLAN_PLUGIN}/index?${query}`;
}

export function isTencentRoutePlanPluginBuildEnabled(): boolean {
  return process.env.TARO_APP_ENABLE_ROUTE_PLAN_PLUGIN === 'true';
}

/** 构建产物已注册插件且当前账号已授权 */
export function isTencentRoutePlanPluginReady(): boolean {
  if (!isTencentRoutePlanPluginBuildEnabled()) return false;
  if (process.env.TARO_ENV !== 'weapp') return false;
  try {
    Taro.requirePlugin(TENCENT_ROUTE_PLAN_PLUGIN);
    return true;
  } catch {
    return false;
  }
}

function routePlanSetupHint(): string {
  if (!isTencentRoutePlanPluginBuildEnabled()) {
    return (
      '当前构建未启用路线规划插件（避免未授权导致模拟器白屏）。\n' +
      '已在公众平台添加插件后，在 .env 设置 TARO_APP_ENABLE_ROUTE_PLAN_PLUGIN=true 并重新编译。'
    );
  }
  return (
    '插件未授权或 Apply 失败（错误码 89260 常见于测试号/个人主体）。\n' +
    '请用正式 AppID，在公众平台 → 插件管理 或 微信服务市场 添加「腾讯位置服务路线规划」。'
  );
}

async function promptRoutePlanPluginSetup(
  destination: TencentRoutePlanDestination,
): Promise<'fallback' | 'dismiss'> {
  const { confirm } = await Taro.showModal({
    title: '路线规划插件不可用',
    content: `${routePlanSetupHint()}\n\n是否先用微信地图查看会场位置？`,
    confirmText: '打开地图',
    cancelText: '知道了',
  });
  return confirm ? 'fallback' : 'dismiss';
}

/** 打开腾讯 routePlan 插件页：多方案路线、驾车拥堵配色、步行规划 */
export async function openTencentRoutePlan(
  destination: TencentRoutePlanDestination,
  mode: TencentRoutePlanMode,
): Promise<void> {
  if (process.env.TARO_ENV !== 'weapp') {
    void Taro.showToast({ title: '路线规划仅支持微信小程序', icon: 'none' });
    return;
  }

  if (!isTencentRoutePlanPluginReady()) {
    const action = await promptRoutePlanPluginSetup(destination);
    if (action === 'fallback') {
      openTencentLocationFallback(destination);
    }
    return;
  }

  const url = buildRoutePlanUrl(destination, mode);
  if (!url) {
    void Taro.showToast({ title: '请配置 TARO_APP_QQ_MAP_KEY', icon: 'none' });
    return;
  }

  const hasLocation =
    await ensureUserLocationAuthorized('路线规划将使用您的当前位置作为起点');
  if (!hasLocation) {
    void Taro.showToast({ title: '未授权定位，可在插件内选手动起点', icon: 'none' });
  }

  try {
    await Taro.navigateTo({ url });
  } catch (error) {
    if (process.env.NODE_ENV !== 'production') {
      console.warn('[tencent-route-plan] navigate failed:', error);
    }
    const action = await promptRoutePlanPluginSetup(destination);
    if (action === 'fallback') {
      openTencentLocationFallback(destination);
    }
  }
}

/** 选择驾车 / 步行后进入 routePlan（未授权时降级为微信地图） */
export function promptTencentRoutePlan(destination: TencentRoutePlanDestination): void {
  void Taro.showActionSheet({
    itemList: ['驾车路线（多方案 · 拥堵配色）', '步行路线'],
    success: (res) => {
      const mode: TencentRoutePlanMode = res.tapIndex === 1 ? 'walking' : 'driving';
      void openTencentRoutePlan(destination, mode);
    },
  });
}

/** 插件不可用时的兜底：系统地图查看终点 */
export function openTencentLocationFallback(
  destination: TencentRoutePlanDestination,
): void {
  void Taro.openLocation({
    latitude: destination.latitude,
    longitude: destination.longitude,
    name: destination.name,
    address: destination.address ?? destination.name,
    scale: 18,
  }).catch(() => {
    void Taro.showToast({ title: '无法打开地图', icon: 'none' });
  });
}
