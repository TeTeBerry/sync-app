import Taro from '@tarojs/taro';

export type TencentRoutePlanDestination = {
  name: string;
  latitude: number;
  longitude: number;
  address?: string;
};

/** 在系统地图中查看终点 */
export function promptTencentRoutePlan(destination: TencentRoutePlanDestination): void {
  if (process.env.TARO_ENV !== 'weapp') {
    void Taro.showToast({ title: '地图仅支持微信小程序', icon: 'none' });
    return;
  }
  openTencentLocationFallback(destination);
}

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
