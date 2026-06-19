import { Text, View } from '@tarojs/components';

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
  if (disabled) {
    return (
      <Text className="s-event-detail-post-filter__hint">
        筛选与 AI 搜索不可同时使用，请清空搜索框后再筛选
      </Text>
    );
  }

  if (cityOptions.length === 0) {
    return null;
  }

  return (
    <View className="s-event-detail-post-filter">
      <View className="s-event-detail-post-filter__row">
        <View className="s-event-detail-post-filter__chips" aria-label="按出发城市筛选">
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
            清除筛选
          </Text>
        ) : null}
      </View>
    </View>
  );
}
