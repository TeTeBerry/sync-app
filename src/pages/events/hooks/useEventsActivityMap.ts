import type { MapProps } from '@tarojs/components';
import Taro, { getCurrentInstance } from '@tarojs/taro';
import { useCallback, useEffect, useMemo, useState } from 'react';
import type { ActivityMapRegion } from '../../../constants/activityMapRegion';
import {
  ensureUserLocationAuthorized,
  getUserGcj02Location,
  isWechatDevtoolsMapLimited,
  resolveTencentMapSubkeyForRuntime,
  safeMapIncludePoints,
  safeMapMoveToLocation,
} from '../../../utils/tencentMap';
import type { EventCardUi } from '../../../utils/apiMappers';
import { promptMappableActivitiesRoutePlan } from '../../../utils/activityMapRoutePlan';
import {
  buildActivityMapMarkers,
  computeActivityMapViewport,
  filterMappableActivitiesByRegion,
} from '../../../utils/activityMapMarkers';

export const EVENTS_MAP_ID = 'sync-events-map';

/** 活动地图用 2D 标准视图；3D / subkey 在开发者工具易触发 render layer 报错。 */
const MAP_SETTING: MapProps['setting'] = {
  enableZoom: true,
  enableScroll: true,
  showCompass: false,
};

function getMapScope(): TaroGeneral.IAnyObject | undefined {
  const inst = getCurrentInstance();
  return (inst?.page ?? inst) as TaroGeneral.IAnyObject | undefined;
}

type UseEventsActivityMapOptions = {
  events: EventCardUi[];
  region: ActivityMapRegion;
  onMarkerOpenDetail: (legacyId: string) => void;
};

export function useEventsActivityMap({
  events,
  region,
  onMarkerOpenDetail,
}: UseEventsActivityMapOptions) {
  const regionActivities = useMemo(
    () => filterMappableActivitiesByRegion(events, region),
    [events, region],
  );

  const viewport = useMemo(
    () => computeActivityMapViewport(regionActivities),
    [regionActivities],
  );

  const [mapCenter, setMapCenter] = useState(() => ({
    latitude: viewport.latitude,
    longitude: viewport.longitude,
    scale: viewport.scale,
  }));

  useEffect(() => {
    setMapCenter({
      latitude: viewport.latitude,
      longitude: viewport.longitude,
      scale: viewport.scale,
    });
  }, [region, viewport.latitude, viewport.longitude, viewport.scale]);

  const markers = useMemo(
    () => buildActivityMapMarkers(regionActivities),
    [regionActivities],
  );

  const onMarkerTap = useCallback(
    (e: { detail?: { markerId?: number | string } }) => {
      const markerId = e.detail?.markerId;
      if (markerId == null || markerId === '') return;
      onMarkerOpenDetail(String(markerId));
    },
    [onMarkerOpenDetail],
  );

  const openRoutePlan = useCallback(() => {
    promptMappableActivitiesRoutePlan(regionActivities);
  }, [regionActivities]);

  const moveToUserLocation = useCallback(async () => {
    const authorized =
      await ensureUserLocationAuthorized('用于在活动地图上定位到您当前的位置');
    if (!authorized) {
      void Taro.showToast({ title: '需要定位权限', icon: 'none' });
      return;
    }

    try {
      const coords = await getUserGcj02Location();
      setMapCenter({
        latitude: coords.latitude,
        longitude: coords.longitude,
        scale: 14,
      });
      if (!isWechatDevtoolsMapLimited()) {
        const ctx = Taro.createMapContext(EVENTS_MAP_ID, getMapScope());
        safeMapMoveToLocation(ctx, coords);
      }
    } catch {
      void Taro.showToast({
        title: isWechatDevtoolsMapLimited()
          ? '模拟器请在顶部菜单设置模拟定位'
          : '定位失败，请检查系统定位是否开启',
        icon: 'none',
      });
    }
  }, []);

  const mapSubkey = resolveTencentMapSubkeyForRuntime();

  const mapProps: MapProps = useMemo(
    () => ({
      id: EVENTS_MAP_ID,
      className: 's-events-map__canvas',
      latitude: mapCenter.latitude,
      longitude: mapCenter.longitude,
      scale: mapCenter.scale,
      minScale: 3,
      maxScale: 18,
      showLocation: true,
      enablePoi: true,
      markers,
      ...(mapSubkey ? { subkey: mapSubkey } : {}),
      setting: MAP_SETTING,
      onMarkerTap,
      onError: () => {
        if (process.env.NODE_ENV !== 'production') {
          console.warn('[events-map] map render error');
        }
      },
    }),
    [
      mapCenter.latitude,
      mapCenter.longitude,
      mapCenter.scale,
      mapSubkey,
      markers,
      onMarkerTap,
    ],
  );

  useEffect(() => {
    if (!viewport.includePoints.length) return;
    const ctx = Taro.createMapContext(EVENTS_MAP_ID, getMapScope());
    safeMapIncludePoints(ctx, {
      points: viewport.includePoints,
      padding: [48, 32, 56, 32],
    });
  }, [region, regionActivities.length, viewport.includePoints]);

  return {
    mapProps,
    mapRegionKey: region,
    regionActivities,
    openRoutePlan,
    moveToUserLocation,
  };
}
