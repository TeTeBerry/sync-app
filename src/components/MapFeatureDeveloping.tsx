import type { FC } from 'react';
import { Text, View } from '@tarojs/components';
import { Map } from './icons';
import './MapFeatureDeveloping.scss';

export type MapFeatureDevelopingProps = {
  className?: string;
  title?: string;
  subtitle?: string;
};

const MapFeatureDeveloping: FC<MapFeatureDevelopingProps> = ({
  className,
  title = '地图功能正在开发中',
  subtitle = '场馆地图与导航即将上线，敬请期待',
}) => (
  <View
    data-cmp="MapFeatureDeveloping"
    className={['s-map-developing', className].filter(Boolean).join(' ')}
  >
    <Map size={36} color="#8e8e93" aria-hidden />
    <Text className="s-map-developing__title">{title}</Text>
    <Text className="s-map-developing__subtitle">{subtitle}</Text>
  </View>
);

export default MapFeatureDeveloping;
