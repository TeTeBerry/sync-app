import { useMemo, useState } from 'react';
import { ScrollView, Text, View } from '@tarojs/components';
import ActionSheet from '@/components/ActionSheet';
import { useT } from '@/hooks/useI18n';
import {
  pickInlineDepartureCities,
  EVENT_DETAIL_INLINE_CITY_CHIP_LIMIT,
} from '../utils/filterEventDetailPostsByRules';

type EventDetailPostFilterBarProps = {
  cityOptions: string[];
  selectedCity: string;
  onSelectedCityChange: (city: string) => void;
  recruitingOnly: boolean;
  onRecruitingOnlyChange: (next: boolean) => void;
  disabled?: boolean;
};

export function EventDetailPostFilterBar({
  cityOptions,
  selectedCity,
  onSelectedCityChange,
  recruitingOnly,
  onRecruitingOnlyChange,
  disabled = false,
}: EventDetailPostFilterBarProps) {
  const t = useT();
  const [citySheetOpen, setCitySheetOpen] = useState(false);

  const { inlineCities, hasOverflow } = useMemo(
    () => pickInlineDepartureCities(cityOptions, selectedCity),
    [cityOptions, selectedCity],
  );

  const chipClassName = (active: boolean, variant?: 'more') =>
    [
      's-event-detail-post-filter__chip',
      active && 's-event-detail-post-filter__chip--active',
      variant === 'more' && 's-event-detail-post-filter__chip--more',
      disabled && 's-event-detail-post-filter__chip--disabled',
    ]
      .filter(Boolean)
      .join(' ');

  const handleRecruitingOnlyClick = () => {
    if (disabled) return;
    onRecruitingOnlyChange(!recruitingOnly);
  };

  const handleCityClick = (city: string, active: boolean) => {
    if (disabled) return;
    onSelectedCityChange(active ? '' : city);
  };

  const handleOpenCitySheet = () => {
    if (disabled) return;
    setCitySheetOpen(true);
  };

  const handleCloseCitySheet = () => {
    setCitySheetOpen(false);
  };

  const handleSelectCityFromSheet = (city: string) => {
    if (disabled) return;
    onSelectedCityChange(city);
    setCitySheetOpen(false);
  };

  const citySheetItems = [
    {
      label: t('eventDetail.filterCityAll'),
      active: !selectedCity,
      onSelect: () => handleSelectCityFromSheet(''),
    },
    ...cityOptions.map((city) => ({
      label: city,
      active: selectedCity === city,
      onSelect: () => handleSelectCityFromSheet(city),
    })),
  ];

  const showCityRow = cityOptions.length > 0;
  const defaultTopCities = cityOptions.slice(0, EVENT_DETAIL_INLINE_CITY_CHIP_LIMIT);
  const moreChipActive = Boolean(
    hasOverflow && selectedCity && !defaultTopCities.includes(selectedCity),
  );

  return (
    <View className="s-event-detail-post-filter">
      <ScrollView
        scrollX
        enhanced
        showScrollbar={false}
        className="s-event-detail-post-filter__scroll s-scrollbar-none"
        aria-label={t('eventDetail.filterSection')}
      >
        <View className="s-event-detail-post-filter__chips">
          <View
            className={chipClassName(recruitingOnly)}
            onClick={handleRecruitingOnlyClick}
            role="button"
            aria-pressed={recruitingOnly}
          >
            <Text className="s-event-detail-post-filter__chip-text">
              {t('eventDetail.filterRecruitingOnly')}
            </Text>
          </View>
          {showCityRow
            ? inlineCities.map((city) => {
                const active = selectedCity === city;
                return (
                  <View
                    key={city}
                    className={chipClassName(active)}
                    onClick={() => handleCityClick(city, active)}
                    role="button"
                    aria-pressed={active}
                  >
                    <Text className="s-event-detail-post-filter__chip-text">
                      {city}
                    </Text>
                  </View>
                );
              })
            : null}
          {showCityRow && hasOverflow ? (
            <View
              className={chipClassName(moreChipActive, 'more')}
              onClick={handleOpenCitySheet}
              role="button"
              aria-pressed={moreChipActive}
            >
              <Text className="s-event-detail-post-filter__chip-text">
                {t('eventDetail.filterCityMore')}
              </Text>
            </View>
          ) : null}
        </View>
      </ScrollView>

      <ActionSheet
        open={citySheetOpen}
        title={t('eventDetail.filterCitySheetTitle')}
        items={citySheetItems}
        cancelLabel={t('common.cancel')}
        onCancel={handleCloseCitySheet}
      />
    </View>
  );
}
