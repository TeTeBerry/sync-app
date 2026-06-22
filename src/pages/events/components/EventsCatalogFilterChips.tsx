import type { FC } from 'react';
import { Text, View } from '@tarojs/components';
import { useT } from '@/hooks/useI18n';
import {
  ACTIVITY_MAP_REGION_LABELS,
  ACTIVITY_MAP_REGIONS,
} from '../../../constants/activityMapRegion';
import type {
  EventsCatalogRegionFilter,
  EventsCatalogTimeChip,
} from '../../../utils/filterActivitiesForEventsCatalog';

const TIME_CHIPS: EventsCatalogTimeChip[] = ['upcoming', 'thisMonth', 'hot'];

type EventsCatalogFilterChipsProps = {
  region: EventsCatalogRegionFilter;
  timeChip: EventsCatalogTimeChip | null;
  showTimeChips?: boolean;
  onRegionChange: (region: EventsCatalogRegionFilter) => void;
  onTimeChipChange: (chip: EventsCatalogTimeChip | null) => void;
};

export const EventsCatalogFilterChips: FC<EventsCatalogFilterChipsProps> = ({
  region,
  timeChip,
  showTimeChips = true,
  onRegionChange,
  onTimeChipChange,
}) => {
  const t = useT();

  const handleTimeChipClick = (chip: EventsCatalogTimeChip) => {
    onTimeChipChange(timeChip === chip ? null : chip);
  };

  return (
    <View data-cmp="EventsCatalogFilterChips" className="s-events-catalog-filters">
      <View className="s-events-catalog-filters__row">
        <View
          className={[
            's-events-catalog-filters__chip',
            region === 'all' ? 's-events-catalog-filters__chip--active' : '',
          ]
            .filter(Boolean)
            .join(' ')}
          onClick={() => onRegionChange('all')}
        >
          <Text className="s-events-catalog-filters__chip-text">
            {t('events.catalogFilters.regionAll')}
          </Text>
        </View>
        {ACTIVITY_MAP_REGIONS.map((item) => {
          const active = region === item;
          return (
            <View
              key={item}
              className={[
                's-events-catalog-filters__chip',
                active ? 's-events-catalog-filters__chip--active' : '',
              ]
                .filter(Boolean)
                .join(' ')}
              onClick={() => onRegionChange(item)}
            >
              <Text className="s-events-catalog-filters__chip-text">
                {ACTIVITY_MAP_REGION_LABELS[item]}
              </Text>
            </View>
          );
        })}
      </View>

      {showTimeChips ? (
        <View className="s-events-catalog-filters__row">
          {TIME_CHIPS.map((chip) => {
            const active = timeChip === chip;
            return (
              <View
                key={chip}
                className={[
                  's-events-catalog-filters__chip',
                  active ? 's-events-catalog-filters__chip--active' : '',
                ]
                  .filter(Boolean)
                  .join(' ')}
                onClick={() => handleTimeChipClick(chip)}
              >
                <Text className="s-events-catalog-filters__chip-text">
                  {t(`events.catalogFilters.time.${chip}`)}
                </Text>
              </View>
            );
          })}
        </View>
      ) : null}
    </View>
  );
};
