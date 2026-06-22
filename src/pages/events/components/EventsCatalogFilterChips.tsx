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
  embedded?: boolean;
  onRegionChange: (region: EventsCatalogRegionFilter) => void;
  onTimeChipChange: (chip: EventsCatalogTimeChip | null) => void;
};

function FilterChip({
  active,
  label,
  onClick,
}: {
  active: boolean;
  label: string;
  onClick: () => void;
}) {
  return (
    <View
      className={[
        's-events-catalog-filters__chip',
        active ? 's-events-catalog-filters__chip--active' : '',
      ]
        .filter(Boolean)
        .join(' ')}
      onClick={onClick}
    >
      {active ? (
        <View className="s-events-catalog-filters__chip-accent" aria-hidden />
      ) : null}
      <Text
        className={[
          's-events-catalog-filters__chip-text',
          active ? 's-events-catalog-filters__chip-text--active' : '',
        ]
          .filter(Boolean)
          .join(' ')}
      >
        {label}
      </Text>
    </View>
  );
}

export const EventsCatalogFilterChips: FC<EventsCatalogFilterChipsProps> = ({
  region,
  timeChip,
  showTimeChips = true,
  embedded = false,
  onRegionChange,
  onTimeChipChange,
}) => {
  const t = useT();

  const handleTimeChipClick = (chip: EventsCatalogTimeChip) => {
    onTimeChipChange(timeChip === chip ? null : chip);
  };

  return (
    <View
      data-cmp="EventsCatalogFilterChips"
      className={[
        's-events-catalog-filters',
        embedded ? 's-events-catalog-filters--embedded' : '',
      ]
        .filter(Boolean)
        .join(' ')}
    >
      <View className="s-events-catalog-filters__group">
        <Text className="s-events-catalog-filters__label">
          {t('events.catalogFilters.regionLabel')}
        </Text>
        <View className="s-events-catalog-filters__row">
          <FilterChip
            active={region === 'all'}
            label={t('events.catalogFilters.regionAll')}
            onClick={() => onRegionChange('all')}
          />
          {ACTIVITY_MAP_REGIONS.map((item) => (
            <FilterChip
              key={item}
              active={region === item}
              label={ACTIVITY_MAP_REGION_LABELS[item]}
              onClick={() => onRegionChange(item)}
            />
          ))}
        </View>
      </View>

      {showTimeChips ? (
        <View className="s-events-catalog-filters__group">
          <Text className="s-events-catalog-filters__label">
            {t('events.catalogFilters.timeLabel')}
          </Text>
          <View className="s-events-catalog-filters__row">
            {TIME_CHIPS.map((chip) => (
              <FilterChip
                key={chip}
                active={timeChip === chip}
                label={t(`events.catalogFilters.time.${chip}`)}
                onClick={() => handleTimeChipClick(chip)}
              />
            ))}
          </View>
        </View>
      ) : null}
    </View>
  );
};
