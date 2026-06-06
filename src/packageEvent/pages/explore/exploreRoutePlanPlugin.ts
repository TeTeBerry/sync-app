/** 腾讯位置服务 · 路线规划插件（须在公众平台授权后才写入 app.json） */
export const EXPLORE_ROUTE_PLAN_PLUGIN = 'route-plan';
export const EXPLORE_ROUTE_PLAN_PROVIDER = 'wx50b5593e81dd937a';
export const EXPLORE_ROUTE_PLAN_VERSION = '2.2.0';

export function isExploreRoutePlanPluginBuildEnabled(): boolean {
  return process.env.TARO_APP_ENABLE_ROUTE_PLAN_PLUGIN === 'true';
}

export const EXPLORE_ROUTE_PLAN_APP_CONFIG = {
  [EXPLORE_ROUTE_PLAN_PLUGIN]: {
    version: EXPLORE_ROUTE_PLAN_VERSION,
    provider: EXPLORE_ROUTE_PLAN_PROVIDER,
  },
} as const;
