/** 深圳国际会展中心（宝安新馆）· 17 号馆 */
export const EXPLORE_MAP_ID = 'sync-explore-map';

export const EXPLORE_VENUE_NAME = '深圳国际会展中心17号馆';

export const EXPLORE_VENUE_ADDRESS = '深圳市宝安区福海街道展城路1号';

/** 17 号馆馆体中心（与 STORM 场内沙盘 VENUE 一致，GCJ-02） */
export const EXPLORE_VENUE_CENTER = {
  latitude: 22.69642,
  longitude: 113.77418,
} as const;

/** 17 号馆馆体范围（由场内 GeoJSON 外接矩形得出，柔光与演示用户均落在此范围内） */
export const EXPLORE_HALL_BOUNDS = {
  minLng: 113.77208,
  maxLng: 113.77628,
  minLat: 22.69394,
  maxLat: 22.6989,
} as const;

export const EXPLORE_HALL_POLYGON = [
  { latitude: EXPLORE_HALL_BOUNDS.maxLat, longitude: EXPLORE_HALL_BOUNDS.minLng },
  { latitude: EXPLORE_HALL_BOUNDS.maxLat, longitude: EXPLORE_HALL_BOUNDS.maxLng },
  { latitude: EXPLORE_HALL_BOUNDS.minLat, longitude: EXPLORE_HALL_BOUNDS.maxLng },
  { latitude: EXPLORE_HALL_BOUNDS.minLat, longitude: EXPLORE_HALL_BOUNDS.minLng },
] as const;

/** 馆体外扩柔光罩 */
export const EXPLORE_HALL_GLOW_POLYGON = [
  { latitude: 22.69935, longitude: 113.77135 },
  { latitude: 22.69935, longitude: 113.77705 },
  { latitude: 22.69345, longitude: 113.77705 },
  { latitude: 22.69345, longitude: 113.77135 },
] as const;

/** 固定场馆标注（不参与点聚合） */
export const EXPLORE_VENUE_MARKER_ID = 2;

/** 默认缩放：可完整看到 17 号馆柔光区域 */
export const EXPLORE_MAP_SCALE = 16;
