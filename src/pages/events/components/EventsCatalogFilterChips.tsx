import type { FC } from 'react';
import { Text, View } from '@tarojs/components';
import { Chip, ChipRow } from '@/components/ui';
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
  const chipSize = compact ? 'sm' : 'md';

  const handleTimeChipClick = (chip: EventsCatalogTimeChip) => {
    onTimeChipChange(timeChip === chip ? null : chip);
  };

  const regionChips = (
    <>
      <Chip
        active={region === 'all'}
        size={chipSize}
        label={t('events.catalogFilters.regionAll')}
        onClick={() => onRegionChange('all')}
      />
      {ACTIVITY_MAP_REGIONS.map((item) => (
        <Chip
          key={item}
          active={region === item}
          size={chipSize}
          label={t(`activity.mapRegions.${item}`)}
          onClick={() => onRegionChange(item)}
        />
      ))}
    </>
  );

  const timeChipRow = showTimeChips
    ? TIME_CHIPS.map((chip) => (
        <Chip
          key={chip}
          active={timeChip === chip}
          size={chipSize}
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
          <ChipRow className="s-events-catalog-filters__row">{regionChips}</ChipRow>
          {showTimeChips ? (
            <>
              <View className="s-events-catalog-filters__sep" aria-hidden />
              <ChipRow className="s-events-catalog-filters__row">{timeChipRow}</ChipRow>
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
            <ChipRow className="s-events-catalog-filters__row">{regionChips}</ChipRow>
          </View>
          {showTimeChips ? (
            <View className="s-events-catalog-filters__group">
              {!compact ? (
                <Text className="s-events-catalog-filters__label">
                  {t('events.catalogFilters.timeLabel')}
                </Text>
              ) : null}
              <ChipRow className="s-events-catalog-filters__row">{timeChipRow}</ChipRow>
            </View>
          ) : null}
        </>
      )}
    </View>
  );
};
