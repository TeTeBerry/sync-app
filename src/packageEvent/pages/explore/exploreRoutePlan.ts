import {
  openTencentLocationFallback,
  openTencentRoutePlan,
  promptTencentRoutePlan,
  type TencentRoutePlanMode,
} from '../../../utils/tencentMapRoutePlan';
import {
  EXPLORE_VENUE_ADDRESS,
  EXPLORE_VENUE_GATE_15,
  EXPLORE_VENUE_NAME,
} from './exploreMapVenue';

export type ExploreRoutePlanMode = TencentRoutePlanMode;

const STORM_ROUTE_DESTINATION = {
  name: EXPLORE_VENUE_NAME,
  latitude: EXPLORE_VENUE_GATE_15.latitude,
  longitude: EXPLORE_VENUE_GATE_15.longitude,
  address: EXPLORE_VENUE_ADDRESS,
} as const;

export {
  isTencentRoutePlanPluginBuildEnabled as isExploreRoutePlanPluginBuildEnabled,
  isTencentRoutePlanPluginReady as isExploreRoutePlanPluginReady,
} from '../../../utils/tencentMapRoutePlan';

/** 打开腾讯 routePlan 插件页：多方案路线、驾车拥堵配色、步行规划 */
export async function openExploreRoutePlan(mode: ExploreRoutePlanMode): Promise<void> {
  return openTencentRoutePlan(STORM_ROUTE_DESTINATION, mode);
}

/** 选择驾车 / 步行后进入 routePlan（未授权时降级为微信地图） */
export function promptExploreRoutePlan(): void {
  promptTencentRoutePlan(STORM_ROUTE_DESTINATION);
}

/** 插件不可用时的兜底：系统地图查看终点 */
export function openExploreVenueLocationFallback(): void {
  openTencentLocationFallback(STORM_ROUTE_DESTINATION);
}
