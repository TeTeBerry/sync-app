import type { FC } from 'react';
import { Text, View } from '@tarojs/components';
import { Map } from './icons';
import { useT } from '@/hooks/useI18n';
import './MapFeatureDeveloping.scss';

export type MapFeatureDevelopingProps = {
  className?: string;
  title?: string;
  subtitle?: string;
};

const MapFeatureDeveloping: FC<MapFeatureDevelopingProps> = ({
  className,
  title,
  subtitle,
}) => {
  const t = useT();
  const displayTitle = title ?? t('map.developingTitle');
  const displaySubtitle = subtitle ?? t('map.developingSubtitle');
  return (
    <View
      data-cmp="MapFeatureDeveloping"
      className={['s-map-developing', className].filter(Boolean).join(' ')}
    >
      <Map size={36} color="#8e8e93" aria-hidden />
      <Text className="s-map-developing__title">{displayTitle}</Text>
      <Text className="s-map-developing__subtitle">{displaySubtitle}</Text>
    </View>
  );
};

export default MapFeatureDeveloping;
