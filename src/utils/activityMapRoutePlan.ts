import Taro from '@tarojs/taro';
import { shortenActivityMapTitle, type MappableActivity } from './activityMapMarkers';
import {
  promptTencentRoutePlan,
  type TencentRoutePlanDestination,
} from './tencentMapRoutePlan';

function toRouteDestination(activity: MappableActivity): TencentRoutePlanDestination {
  return {
    name: activity.title,
    latitude: activity.latitude,
    longitude: activity.longitude,
    address: activity.location,
  };
}

/** 当前区域 1 场活动直接打开地图；多场先选活动。 */
export function promptMappableActivitiesRoutePlan(
  activities: MappableActivity[],
): void {
  if (!activities.length) {
    void Taro.showToast({ title: '该区域暂无活动', icon: 'none' });
    return;
  }

  if (activities.length === 1) {
    promptTencentRoutePlan(toRouteDestination(activities[0]));
    return;
  }

  void Taro.showActionSheet({
    itemList: activities.map((activity) => shortenActivityMapTitle(activity.title)),
    success: (res) => {
      const activity = activities[res.tapIndex];
      if (!activity) return;
      promptTencentRoutePlan(toRouteDestination(activity));
    },
  });
}
