import type { FC } from 'react';
import { useT } from '@/hooks/useI18n';
import { Text, View } from '@tarojs/components';
import {
  ACTIVITY_MAP_REGIONS,
  type ActivityMapRegion,
} from '../../../constants/activityMapRegion';

type EventsMapRegionTabsProps = {
  activeRegion: ActivityMapRegion;
  activityCount: number;
  onChange: (region: ActivityMapRegion) => void;
};

export const EventsMapRegionTabs: FC<EventsMapRegionTabsProps> = ({
  activeRegion,
  activityCount,
  onChange,
}) => {
  const t = useT();
  return (
    <View data-cmp="EventsMapRegionTabs" className="s-events-map-region">
      <View className="s-events-map-region__filters">
        {ACTIVITY_MAP_REGIONS.map((region) => {
          const active = region === activeRegion;
          return (
            <View
              key={region}
              className={[
                's-events-map-region__chip',
                active ? 's-events-map-region__chip--active' : '',
              ]
                .filter(Boolean)
                .join(' ')}
              onClick={() => onChange(region)}
            >
              <Text className="s-events-map-region__chip-text">
                {t(`activity.mapRegions.${region}`)}
              </Text>
            </View>
          );
        })}
      </View>
      <View className="s-events-map-region__count">
        <View className="s-events-map-region__count-dot" aria-hidden />
        <Text className="s-events-map-region__count-text">
          {t('events.upcomingCount', { count: activityCount })}
        </Text>
      </View>
    </View>
  );
};
