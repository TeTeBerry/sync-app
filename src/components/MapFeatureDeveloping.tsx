import type { FC } from 'react';
import { Text, View } from '@tarojs/components';
import { Users } from './icons';
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
  const displayTitle = title ?? t('events.artists');
  const displaySubtitle = subtitle ?? t('events.artistsHint');
  return (
    <View
      data-cmp="MapFeatureDeveloping"
      className={`s-map-developing ${className || ''}`.trim()}
    >
      <Users size={36} color="#8e8e93" aria-hidden />
      <Text className="s-map-developing__title">{displayTitle}</Text>
      <Text className="s-map-developing__subtitle">{displaySubtitle}</Text>
    </View>
  );
};

export default MapFeatureDeveloping;
