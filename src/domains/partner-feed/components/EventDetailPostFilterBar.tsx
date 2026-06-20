import { Text, View } from '@tarojs/components';
import { useT } from '@/hooks/useI18n';

type EventDetailPostFilterBarProps = {
  cityOptions: string[];
  selectedCity: string;
  onSelectedCityChange: (city: string) => void;
  disabled?: boolean;
  onClear?: () => void;
  isActive?: boolean;
};

export function EventDetailPostFilterBar({
  cityOptions,
  selectedCity,
  onSelectedCityChange,
  disabled = false,
  onClear,
  isActive = false,
}: EventDetailPostFilterBarProps) {
  const t = useT();
  if (disabled) {
    return (
      <Text className="s-event-detail-post-filter__hint">
        {t('eventDetail.filterHint')}
      </Text>
    );
  }

  if (cityOptions.length === 0) {
    return null;
  }

  return (
    <View className="s-event-detail-post-filter">
      <View className="s-event-detail-post-filter__row">
        <View
          className="s-event-detail-post-filter__chips"
          aria-label={t('eventDetail.filterByCity')}
        >
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
    </View>
  );
}
