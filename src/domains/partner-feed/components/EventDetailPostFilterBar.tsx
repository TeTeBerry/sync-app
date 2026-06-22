import { ScrollView, Text, View } from '@tarojs/components';
import { useT } from '@/hooks/useI18n';

type EventDetailPostFilterBarProps = {
  cityOptions: string[];
  selectedCity: string;
  onSelectedCityChange: (city: string) => void;
  onClear?: () => void;
  isActive?: boolean;
};

export function EventDetailPostFilterBar({
  cityOptions,
  selectedCity,
  onSelectedCityChange,
  onClear,
  isActive = false,
}: EventDetailPostFilterBarProps) {
  const t = useT();

  if (cityOptions.length === 0) {
    return null;
  }

  return (
    <View className="s-event-detail-post-filter">
      <View className="s-event-detail-post-filter__head">
        <Text className="s-event-detail-post-filter__label">
          {t('eventDetail.filterByCity')}
        </Text>
        {isActive && onClear ? (
          <Text
            className="s-event-detail-post-filter__clear"
            onClick={onClear}
            role="button"
          >
            {t('eventDetail.clearFilter')}
          </Text>
        ) : null}
      </View>
      <ScrollView
        scrollX
        enhanced
        showScrollbar={false}
        className="s-event-detail-post-filter__scroll s-scrollbar-none"
        aria-label={t('eventDetail.filterByCity')}
      >
        <View className="s-event-detail-post-filter__chips">
          {cityOptions.map((city) => {
            const active = selectedCity === city;
            return (
              <View
                key={city}
                className={[
                  's-event-detail-post-filter__chip',
                  active && 's-event-detail-post-filter__chip--active',
                ]
                  .filter(Boolean)
                  .join(' ')}
                onClick={() => onSelectedCityChange(active ? '' : city)}
                role="button"
                aria-pressed={active}
              >
                <Text className="s-event-detail-post-filter__chip-text">{city}</Text>
              </View>
            );
          })}
        </View>
      </ScrollView>
    </View>
  );
}
