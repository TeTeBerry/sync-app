import type { FC } from 'react';
import { Text, View } from '@tarojs/components';
import { useT } from '@/hooks/useI18n';
import { ACTIVITY_MAP_REGIONS } from '../../../constants/activityMapRegion';
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
  compact?: boolean;
  singleRow?: boolean;
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
  compact = false,
  singleRow = false,
  onRegionChange,
  onTimeChipChange,
}) => {
  const t = useT();

  const handleTimeChipClick = (chip: EventsCatalogTimeChip) => {
    onTimeChipChange(timeChip === chip ? null : chip);
  };

  const regionChips = (
    <>
      <FilterChip
        active={region === 'all'}
        label={t('events.catalogFilters.regionAll')}
        onClick={() => onRegionChange('all')}
      />
      {ACTIVITY_MAP_REGIONS.map((item) => (
        <FilterChip
          key={item}
          active={region === item}
          label={t(`activity.mapRegions.${item}`)}
          onClick={() => onRegionChange(item)}
        />
      ))}
    </>
  );

  const timeChipRow = showTimeChips
    ? TIME_CHIPS.map((chip) => (
        <FilterChip
          key={chip}
          active={timeChip === chip}
          label={t(`events.catalogFilters.time.${chip}`)}
          onClick={() => handleTimeChipClick(chip)}
        />
      ))
    : null;

  return (
    <View
      data-cmp="EventsCatalogFilterChips"
      className={[
        's-events-catalog-filters',
        embedded ? 's-events-catalog-filters--embedded' : '',
        compact ? 's-events-catalog-filters--compact' : '',
        singleRow ? 's-events-catalog-filters--single-row' : '',
      ]
        .filter(Boolean)
        .join(' ')}
    >
      {singleRow ? (
        <View className="s-events-catalog-filters__scroll s-scrollbar-none">
          <View className="s-events-catalog-filters__row">{regionChips}</View>
          {showTimeChips ? (
            <>
              <View className="s-events-catalog-filters__sep" aria-hidden />
              <View className="s-events-catalog-filters__row">{timeChipRow}</View>
            </>
          ) : null}
        </View>
      ) : (
        <>
          <View className="s-events-catalog-filters__group">
            {!compact ? (
              <Text className="s-events-catalog-filters__label">
                {t('events.catalogFilters.regionLabel')}
              </Text>
            ) : null}
            <View className="s-events-catalog-filters__row">{regionChips}</View>
          </View>
          {showTimeChips ? (
            <View className="s-events-catalog-filters__group">
              {!compact ? (
                <Text className="s-events-catalog-filters__label">
                  {t('events.catalogFilters.timeLabel')}
                </Text>
              ) : null}
              <View className="s-events-catalog-filters__row">{timeChipRow}</View>
            </View>
          ) : null}
        </>
      )}
    </View>
  );
};
